import { connectDB } from "@/lib/detabaseConnection";
import { catchError } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import CategoryModel from "@/models/Category.model";
import ReviewModel from "@/models/Review.model"; // Ensure Review is registered
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: Request) {
    try {
        await connectDB();

        // Register models to ensure population works
        if (!MediaModel) console.log("MediaModel needed for population");
        if (!CategoryModel) console.log("CategoryModel needed for population");
        if (!ReviewModel) console.log("ReviewModel needed for pipeline");

        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const skip = (page - 1) * limit;

        // Filtering
        const categorySlug = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const search = searchParams.get('search');

        // Sorting
        const sortParam = searchParams.get('sort') || 'latest';

        // Build Match Stage
        const matchStage: any = { deletedAt: null };

        // 1. Filter by Category (needs lookup first if filtering by slug, but here we can try to find category ID first)
        if (categorySlug) {
            const category = await CategoryModel.findOne({ slug: categorySlug, deletedAt: null });
            if (category) {
                matchStage.category = category._id;
            } else {
                // If category not found, return empty
                return NextResponse.json({ success: true, data: [], count: 0, total: 0 });
            }
        }

        // 2. Filter by Price
        if (minPrice || maxPrice) {
            matchStage.sellingPrice = {};
            if (minPrice) matchStage.sellingPrice.$gte = parseFloat(minPrice);
            if (maxPrice) matchStage.sellingPrice.$lte = parseFloat(maxPrice);
        }

        // 3. Search (Name or Description)
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build Sort Stage
        let sortStage: any = { createdAt: -1 }; // Default latest
        if (sortParam === 'price_asc') sortStage = { sellingPrice: 1 };
        if (sortParam === 'price_desc') sortStage = { sellingPrice: -1 };
        if (sortParam === 'rating') sortStage = { averageRating: -1 }; // Needs computed field

        // Aggregation Pipeline
        const pipeline: any[] = [
            { $match: matchStage },

            // Lookup Reviews to calculate rating
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'product',
                    pipeline: [
                        { $match: { deletedAt: null } }
                    ],
                    as: 'reviewsData'
                }
            },

            // Add computed fields for rating
            {
                $addFields: {
                    totalReviews: { $size: "$reviewsData" },
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: "$reviewsData" }, 0] },
                            then: { $avg: "$reviewsData.rating" },
                            else: 0
                        }
                    }
                }
            },

            // Sort
            { $sort: sortStage },

            // Pagination
            { $skip: skip },
            { $limit: limit },

            // Lookup for populate-like behavior
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'medias',
                    localField: 'media',
                    foreignField: '_id',
                    as: 'media'
                }
            },

            // Project final shape
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    description: 1,
                    mrp: 1,
                    sellingPrice: 1,
                    discountPercentage: 1,
                    media: {
                        _id: 1,
                        secure_url: 1,
                        alt: 1
                    },
                    category: {
                        _id: 1,
                        name: 1,
                        slug: 1
                    },
                    averageRating: 1,
                    totalReviews: 1,
                    createdAt: 1
                }
            }
        ];

        const products = await ProductModel.aggregate(pipeline);

        // Get Total Count for Pagination
        const totalCount = await ProductModel.countDocuments(matchStage);

        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error: any) {
        return catchError(error);
    }
}
