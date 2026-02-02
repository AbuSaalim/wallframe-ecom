import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";
import { NextResponse } from "next/server";

/**
 * Safely parse JSON from query param
 */
function safeJSONParse(value, defaultValue = []) {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (err) {
    console.warn(`JSON parse error: ${err.message}`);
    return defaultValue;
  }
}

/**
 * Safely get pagination params
 */
function getPaginationParams(searchParams) {
  const start = Math.max(0, parseInt(searchParams.get("start") || "0", 10));
  const size = Math.max(1, Math.min(100, parseInt(searchParams.get("size") || "10", 10)));
  return { start, size };
}

export async function GET(request) {
  let reviews = [];
  let totalCount = 0;

  try {
    // 🔐 Firebase Auth check
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();

    // 📋 Extract and safely parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const { start, size } = getPaginationParams(searchParams);
    
    const filtersParam = searchParams.get("filters") || "[]";
    const filters = safeJSONParse(filtersParam, []);
    
    const sortingParam = searchParams.get("sorting") || "[]";
    const sorting = safeJSONParse(sortingParam, []);
    
    const globalFilter = (searchParams.get("globalFilter") || "").trim();
    const deleteType = searchParams.get("deleteType") || "SD";

    // 🧠 Build match query with defensive defaults
    let matchQuery = {};

    // 🗑️ Delete logic
    if (deleteType === "PD") {
      matchQuery.deletedAt = { $ne: null };
    } else {
      matchQuery.deletedAt = null; // Default to SD (soft delete)
    }

    // 🔍 Global search with defensive filter
    if (globalFilter && globalFilter.length > 0) {
      try {
        matchQuery["$or"] = [
          { "productData.name": { $regex: globalFilter, $options: "i" } },
          { "userData.name": { $regex: globalFilter, $options: "i" } },
          { rating: { $regex: globalFilter, $options: "i" } },
          { review: { $regex: globalFilter, $options: "i" } },
          { title: { $regex: globalFilter, $options: "i" } },
        ];
      } catch (err) {
        console.warn("Global filter error:", err.message);
      }
    }

    // 🎯 Column filters with defensive handling
    if (Array.isArray(filters) && filters.length > 0) {
      filters.forEach((filter) => {
        try {
          if (!filter.id || !filter.value) return;
          
          const filterValue = String(filter.value).trim();
          if (!filterValue) return;
          
          if (filter.id === "product") {
            matchQuery["productData.name"] = { $regex: filterValue, $options: "i" };
          } else if (filter.id === "user") {
            matchQuery["userData.name"] = { $regex: filterValue, $options: "i" };
          } else if (typeof filter.id === "string") {
            matchQuery[filter.id] = { $regex: filterValue, $options: "i" };
          }
        } catch (err) {
          console.warn(`Filter error for ${filter.id}:`, err.message);
        }
      });
    }

    // 🔃 Build sorting object with defensive defaults
    let sortQuery = { createdAt: -1 };
    if (Array.isArray(sorting) && sorting.length > 0) {
      sortQuery = {};
      sorting.forEach((sort) => {
        try {
          if (sort.id && typeof sort.id === "string") {
            sortQuery[sort.id] = sort.desc ? -1 : 1;
          }
        } catch (err) {
          console.warn("Sort error:", err.message);
        }
      });
      if (Object.keys(sortQuery).length === 0) {
        sortQuery = { createdAt: -1 };
      }
    }

    // 🧩 Aggregation pipeline with safe field values
    const pipeline = [
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: { path: "$productData", preserveAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: { path: "$userData", preserveAndEmptyArrays: true },
      },
      { $match: matchQuery },
      {
        $sort: sortQuery,
      },
      { $skip: Math.max(0, start) },
      { $limit: Math.max(1, size) },
      {
        $project: {
          _id: { $toString: "$_id" },
          product: { $ifNull: ["$productData.name", "Unknown Product"] },
          user: { $ifNull: ["$userData.name", "Unknown User"] },
          rating: { $ifNull: ["$rating", 0] },
          review: { $ifNull: ["$review", ""] },
          title: { $ifNull: ["$title", ""] },
          createdAt: { $ifNull: ["$createdAt", new Date()] },
          updatedAt: { $ifNull: ["$updatedAt", new Date()] },
          deletedAt: { $ifNull: ["$deletedAt", null] },
        },
      },
    ];

    // 📦 Execute aggregation pipeline with defensive error handling
    try {
      reviews = await ReviewModel.aggregate(pipeline);
      if (!Array.isArray(reviews)) {
        reviews = [];
      }
    } catch (aggErr) {
      console.error("Aggregation pipeline error:", aggErr.message);
      reviews = [];
    }

    // 🔢 Get total count with defensive query
    try {
      const countQuery = { deletedAt: deleteType === "PD" ? { $ne: null } : null };
      totalCount = await ReviewModel.countDocuments(countQuery);
      if (!Number.isInteger(totalCount) || totalCount < 0) {
        totalCount = 0;
      }
    } catch (countErr) {
      console.error("Count error:", countErr.message);
      totalCount = reviews.length;
    }

    // ✅ Safe response format
    return NextResponse.json({
      success: true,
      rows: reviews || [],
      total: totalCount || 0,
    });
  } catch (error) {
    console.error("GET /api/review fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        rows: [],
        total: 0,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
