import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    // Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    // Extract query parameters
    const start = parseInt(searchParams.get('start') || '0', 10);
    const size = parseInt(searchParams.get('size') || '10', 10);
    const filters = JSON.parse(searchParams.get('filters') || '[]');
    const globalFilter = searchParams.get('globalFilter') || '';  // ✅ Fixed typo: globalfilters → globalFilter
    const sorting = JSON.parse(searchParams.get('sorting') || '[]');
    const deleteType = searchParams.get('deleteType');
    // Build Match Query
    let matchQuery = {};
    if (deleteType === 'SD') {
      matchQuery = { deletedAt: null };
    } else if (deleteType === 'PD') {
      matchQuery = { deletedAt: { $ne: null } };
    } else {
      // Default: show non-deleted items
      matchQuery = { deletedAt: null };
    }
    // Global search
    if (globalFilter) {
      matchQuery['$or'] = [
        { name: { $regex: globalFilter, $options: 'i' } },
        { slug: { $regex: globalFilter, $options: 'i' } },
      ];
    }
    // Column filtration
    filters.forEach(filter => {
      matchQuery[filter.id] = { $regex: filter.value, $options: 'i' };  // ✅ Fixed syntax error
    });
    // Sorting
    let sortQuery = {};
    sorting.forEach(sort => {
      sortQuery[sort.id] = sort.desc ? -1 : 1;
    });
    // Aggregate pipeline
    const aggregatePipeline = [
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1
        }
      }
    ];
    // Execute Query
    const getCategory = await CategoryModel.aggregate(aggregatePipeline);
    // Get totalRowCount
    const totalRowCount = await CategoryModel.countDocuments(matchQuery);
    return NextResponse.json({
      success: true,  // ✅ Added success flag
      data: getCategory,
      meta: { totalRowCount }
    });
  } catch (error) {
    console.error('GET /api/category error:', error);
    return catchError(error);
  }
}
