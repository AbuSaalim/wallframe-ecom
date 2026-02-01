import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    // 🔐 Auth check
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");
    // 🧠 Match query
    let matchQuery = {};
    // 🗑️ Delete logic
    if (deleteType === "SD") {
      matchQuery.deletedAt = null;
    } else if (deleteType === "PD") {
      matchQuery.deletedAt = { $ne: null };
    } else {
      matchQuery.deletedAt = null;
    }
    // 🔍 Global search
    if (globalFilter) {
      matchQuery["$or"] = [
        { "product": { $regex: globalFilter, $options: "i" } },
        { "user": { $regex: globalFilter, $options: "i" } },
        { rating: { $regex: globalFilter, $options: "i" } },
        { review: { $regex: globalFilter, $options: "i" } },
        { title: { $regex: globalFilter, $options: "i" } },
      ];
    }
    // 🎯 Column filters
    filters.forEach(filter =>{
      if(filter.id === 'product'){
        matchQuery['product'] = {$regex: filter.value, $options : 'i'}
      }else if (filter.id === 'user') {
        matchQuery['user'] = {$regex: filter.value, $options : 'i'}
      }else{
        matchQuery[filter.id] = {$regex: filter.value, $options : 'i'}
      }
    });
    // 🔃 Sorting
    let sortQuery = {};
    sorting.forEach((sort) => {
      if (sort.id) {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      }
    });
    // 🧩 Aggregation pipeline
    const pipeline = [
      {$lookup:{
        from:'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productData'
      }},
      {
        $unwind: {path: 'productData', preserveAndEmptyArrays: true}
      },
      {$lookup:{
        from:'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }},
      {
        $unwind: {path: 'userData', preserveAndEmptyArrays: true}
      },
      { $match: matchQuery },
      {
        $sort: Object.keys(sortQuery).length
          ? sortQuery
          : { createdAt: -1 },
      },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: 1,
          product: '$productData.name',
          user: '$userData.name',
          rating: 1,
          review: 1,
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];
    // 📦 Data fetch
    const getReview = await ReviewModel.aggregate(pipeline);
    // Build count query (without productData/userData fields)
    let countQuery = {};
    if (matchQuery.deletedAt !== undefined) {
      countQuery.deletedAt = matchQuery.deletedAt;
    }
    const totalRowCount = await ReviewModel.countDocuments(countQuery);
    return NextResponse.json({
      success: true,
      data: getReview,
      meta: { totalRowCount },
    });
  } catch (error) {
    console.error("GET /api/review error:", error);
    return catchError(error);
  }
}
