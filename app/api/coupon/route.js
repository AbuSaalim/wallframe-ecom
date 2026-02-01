import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CouponModel from "@/models/Coupon.model";
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
    // Build Match Query for coupons
    let matchQuery = {};
    if (deleteType === 'SD') {
      matchQuery.deletedAt = null;
    } else if (deleteType === 'PD') {
      matchQuery.deletedAt = { $ne: null };
    } else {
      matchQuery.deletedAt = null;
    }
    // Numeric fields that need special handling
    const numericFields = ['discountPercentage', 'minimumShoppingAmount'];
    const dateFields = ['validity', 'createdAt'];
    // Column filtration
    filters.forEach(filter => {
      if (filter.id && filter.value) {
        if (numericFields.includes(filter.id)) {
          // For numeric fields, try exact match or range
          const numValue = parseFloat(filter.value);
          if (!isNaN(numValue)) {
            matchQuery[filter.id] = numValue;
          }
        } else if (dateFields.includes(filter.id)) {
          // For date fields, try to match the date
          const dateValue = new Date(filter.value);
          if (!isNaN(dateValue.getTime())) {
            matchQuery[filter.id] = {
              $gte: new Date(dateValue.setHours(0, 0, 0, 0)),
              $lte: new Date(dateValue.setHours(23, 59, 59, 999))
            };
          }
        } else {
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
    console.log('Match Query:', JSON.stringify(matchQuery, null, 2));
    // Aggregate pipeline
    const aggregatePipeline = [
      { $match: matchQuery },
      // Add string versions of numeric fields for searching
      {
        $addFields: {
          discountPercentageString: { $toString: "$discountPercentage" },
          minimumShoppingAmountString: { $toString: "$minimumShoppingAmount" },
          validityString: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$validity"
            }
          },
          createdAtString: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          }
        }
      }
    ];
    // Global filter with string fields
    if (globalFilter && globalFilter.trim() !== '') {
      aggregatePipeline.push({
        $match: {
          $or: [
            { code: { $regex: globalFilter, $options: 'i' } },
            { discountPercentageString: { $regex: globalFilter, $options: 'i' } },
            { minimumShoppingAmountString: { $regex: globalFilter, $options: 'i' } },
            { validityString: { $regex: globalFilter, $options: 'i' } },
            { createdAtString: { $regex: globalFilter, $options: 'i' } }
          ]
        }
      });
    }
    // Add sorting, skip, limit
    aggregatePipeline.push(
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          code: 1,
          discountPercentage: 1,
          minimumShoppingAmount: 1,
          validity: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1
        }
      }
    );
    console.log('Full Pipeline:', JSON.stringify(aggregatePipeline, null, 2));
    // Execute Query
    const getCoupons = await CouponModel.aggregate(aggregatePipeline);
    // Count pipeline
    const countPipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          discountPercentageString: { $toString: "$discountPercentage" },
          minimumShoppingAmountString: { $toString: "$minimumShoppingAmount" },
          validityString: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$validity"
            }
          },
          createdAtString: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          }
        }
      }
    ];
    if (globalFilter && globalFilter.trim() !== '') {
      countPipeline.push({
        $match: {
          $or: [
            { code: { $regex: globalFilter, $options: 'i' } },
            { discountPercentageString: { $regex: globalFilter, $options: 'i' } },
            { minimumShoppingAmountString: { $regex: globalFilter, $options: 'i' } },
            { validityString: { $regex: globalFilter, $options: 'i' } },
            { createdAtString: { $regex: globalFilter, $options: 'i' } }
          ]
        }
      });
    }
    countPipeline.push({ $count: "total" });
    const countResult = await CouponModel.aggregate(countPipeline);
    const totalRowCount = countResult.length > 0 ? countResult[0].total : 0;
    return NextResponse.json({
      success: true,
      data: getCoupons,
      meta: { totalRowCount }
    });
  } catch (error) {
    console.error('GET /api/coupon error:', error);
    console.error('Error stack:', error.stack);
    return catchError(error);
  }
}
