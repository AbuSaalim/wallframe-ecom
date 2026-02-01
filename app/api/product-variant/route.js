import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    // Check authentication
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    // Extract query parameters
    const start = parseInt(searchParams.get('start') || '0', 10);
    const size = parseInt(searchParams.get('size') || '10', 10);
    const filters = JSON.parse(searchParams.get('filters') || '[]');
    const globalFilter = searchParams.get('globalFilter') || '';
    const sorting = JSON.parse(searchParams.get('sorting') || '[]');
    const deleteType = searchParams.get('deleteType');
    // Build Match Query for products (before lookup)
    let matchQuery = {};
    if (deleteType === 'SD') {
      matchQuery.deletedAt = null;
    } else if (deleteType === 'PD') {
      matchQuery.deletedAt = { $ne: null };
    } else {
      matchQuery.deletedAt = null;
    }
    // Numeric fields that need special handling
    const numericFields = ['mrp', 'sellingPrice', 'discountPercentage'];
    // Column filtration (before lookup)
    filters.forEach(filter => {
      if (filter.id && filter.value) {
        if (filter.id === 'category') {
          // Skip category - will handle after lookup
          return;
        }
        if (numericFields.includes(filter.id)) {
          // For numeric fields, try exact match or range
          const numValue = parseFloat(filter.value);
          if (!isNaN(numValue)) {
            matchQuery[filter.id] = numValue;
          }
        } else if (filter.id === "product") {
          // Handle product filter
          matchQuery[filter.id] = { $regex: filter.value, $options: 'i' };
        }
        else {
          // String fields - use regex
          matchQuery[filter.id] = { $regex: filter.value, $options: 'i' };
        }
      }
    });
    // Sorting
    let sortQuery = {};
    sorting.forEach(sort => {
      if (sort.id) {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      }
    });
    console.log('Initial Match Query:', JSON.stringify(matchQuery, null, 2));
    // Aggregate pipeline
    const aggregatePipeline = [
      { $match: matchQuery },
      // Add string versions of numeric fields for searching
      {
        $addFields: {
          mrpString: { $toString: "$mrp" },
          sellingPriceString: { $toString: "$sellingPrice" },
          discountPercentageString: { $toString: "$discountPercentage" }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      {
        $unwind: {
          path: "$productData",
          preserveNullAndEmptyArrays: true
        }
      }
    ];
    // Build post-lookup match conditions
    let postLookupConditions = [];
    // Category filter
    const categoryFilter = filters.find(f => f.id === 'category');
    if (categoryFilter && categoryFilter.value) {
      postLookupConditions.push({
        'categoryData.name': { $regex: categoryFilter.value, $options: 'i' }
      });
    }
    // Global filter with string fields
    if (globalFilter && globalFilter.trim() !== '') {
      postLookupConditions.push({
        $or: [
          { color: { $regex: globalFilter, $options: 'i' } },
          { size: { $regex: globalFilter, $options: 'i' } },
          { sku: { $regex: globalFilter, $options: 'i' } },
          { 'productData.name': { $regex: globalFilter, $options: 'i' } }
        ]
      });
    }
    // Add post-lookup match if conditions exist
    if (postLookupConditions.length > 0) {
      aggregatePipeline.push({
        $match: postLookupConditions.length === 1 
          ? postLookupConditions[0] 
          : { $and: postLookupConditions }
      });
    }
    // Add sorting, skip, limit, and projection
    aggregatePipeline.push(
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
           _id: 1,
          product: "$productData.name",
          color: 1,
          size: 1,
          sku: 1,
          mrp: 1,
          sellingPrice: 1,
          discountPercentage: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1
        }
      }
    );
    console.log('Full Pipeline:', JSON.stringify(aggregatePipeline, null, 2));
    // Execute Query
    const getProductVariant = await ProductVariantModel.aggregate(aggregatePipeline);
    // Count pipeline
    const countPipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          mrpString: { $toString: "$mrp" },
          sellingPriceString: { $toString: "$sellingPrice" },
          discountPercentageString: { $toString: "$discountPercentage" }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true
        }
      }
    ];
    if (postLookupConditions.length > 0) {
      countPipeline.push({
        $match: postLookupConditions.length === 1 
          ? postLookupConditions[0] 
          : { $and: postLookupConditions }
      });
    }
    countPipeline.push({ $count: "total" });
    const countResult = await ProductVariantModel.aggregate(countPipeline);
    const totalRowCount = countResult.length > 0 ? countResult[0].total : 0;
    return NextResponse.json({
      success: true,
      data: getProductVariant,
      meta: { totalRowCount }
    });
  } catch (error) {
    console.error('GET /api/product error:', error);
    console.error('Error stack:', error.stack);
    return catchError(error);
  }
}
