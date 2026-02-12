import { connectDB } from "@/lib/detabaseConnection";
import { catchError } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import CategoryModel from "@/models/Category.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    try {
        await connectDB();

        // Register models
        if (!MediaModel) console.log("MediaModel needed for population");
        if (!CategoryModel) console.log("CategoryModel needed for population");
        if (!ProductVariantModel) console.log("ProductVariantModel needed for lookup");
        if (!ReviewModel) console.log("ReviewModel needed for pipeline");

        const slug = params.slug;

        // 1. Fetch Product
        const product = await ProductModel.findOne({ slug, deletedAt: null })
            .populate('category', 'name slug')
            .populate('media', 'secure_url alt title')
            .lean();

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        // 2. Fetch Variants
        const variants = await ProductVariantModel.find({ product: product._id, deletedAt: null })
            .populate('media', 'secure_url alt title')
            .lean();

        // 3. Aggregate Reviews for this product
        const reviewAgg = await ReviewModel.aggregate([
            { $match: { product: product._id, deletedAt: null } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const stats = reviewAgg.length > 0 ? reviewAgg[0] : { averageRating: 0, totalReviews: 0 };

        // Combine data
        const productData = {
            ...product,
            variants,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews
        };

        return NextResponse.json({
            success: true,
            data: productData
        });

    } catch (error: any) {
        return catchError(error);
    }
}
