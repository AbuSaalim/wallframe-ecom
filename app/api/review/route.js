import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 🔐 Firebase Auth check
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

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
        { "productData.name": { $regex: globalFilter, $options: "i" } },
        { "userData.name": { $regex: globalFilter, $options: "i" } },
        { rating: { $regex: globalFilter, $options: "i" } },
        { review: { $regex: globalFilter, $options: "i" } },
        { title: { $regex: globalFilter, $options: "i" } },
      ];
    }

    // 🎯 Column filters
    filters.forEach((filter) => {
      if (filter.id === "product") {
        matchQuery["productData.name"] = { $regex: filter.value, $options: "i" };
      } else if (filter.id === "user") {
        matchQuery["userData.name"] = { $regex: filter.value, $options: "i" };
      } else {
        matchQuery[filter.id] = { $regex: filter.value, $options: "i" };
      }
    });

    // 🔃 Sorting
    let sortQuery = {};
    sorting.forEach((sort) => {
      if (sort.id) {
        sortQuery[sort.id] = sort.desc ? -1 : 1;
      }
    });

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
        $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 },
      },
      { $skip: start },
      { $limit: size },
      {
        $project: {
          _id: { $toString: "$_id" },
          product: {
            $ifNull: ["$productData.name", "Unknown Product"],
          },
          user: {
            $ifNull: ["$userData.name", "Unknown User"],
          },
          rating: { $ifNull: ["$rating", 0] },
          review: { $ifNull: ["$review", ""] },
          title: { $ifNull: ["$title", ""] },
          createdAt: { $ifNull: ["$createdAt", new Date()] },
          updatedAt: { $ifNull: ["$updatedAt", new Date()] },
          deletedAt: "$deletedAt",
        },
      },
    ];

    // 📦 Data fetch
    const getReview = await ReviewModel.aggregate(pipeline);

    // Build count query for total count
    let countQuery = { deletedAt: null };
    if (deleteType === "PD") {
      countQuery.deletedAt = { $ne: null };
    }

    // Apply filters to count query
    filters.forEach((filter) => {
      if (filter.id === "product") {
        countQuery["productData.name"] = { $regex: filter.value, $options: "i" };
      } else if (filter.id === "user") {
        countQuery["userData.name"] = { $regex: filter.value, $options: "i" };
      } else {
        countQuery[filter.id] = { $regex: filter.value, $options: "i" };
      }
    });

    const totalRowCount = await ReviewModel.countDocuments(countQuery);

    return NextResponse.json({
      success: true,
      data: getReview || [],
      meta: { totalRowCount: totalRowCount || 0 },
    });
  } catch (error) {
    console.error("GET /api/review error:", error);
    return catchError(error);
  }
}
