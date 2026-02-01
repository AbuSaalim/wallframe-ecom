import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    // 🔐 Auth check
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
    // 🔍 Global search (FIXED for boolean)
    if (globalFilter) {
      matchQuery["$or"] = [
        { name: { $regex: globalFilter, $options: "i" } },
        { email: { $regex: globalFilter, $options: "i" } },
        { phone: { $regex: globalFilter, $options: "i" } },
        { address: { $regex: globalFilter, $options: "i" } },
        ...(globalFilter.toLowerCase() === "verified"
          ? [{ isEmailVerified: true }]
          : []),
        ...(globalFilter.toLowerCase() === "not verified"
          ? [{ isEmailVerified: false }]
          : []),
      ];
    }
    // 🎯 Column filters
    filters.forEach((filter) => {
      if (filter.id === "isEmailVerified") {
        matchQuery.isEmailVerified = filter.value === "true";
      } else {
        matchQuery[filter.id] = {
          $regex: filter.value,
          $options: "i",
        };
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
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          avatar: "$avatar.url",
          isEmailVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      },
    ];
    // 📦 Data fetch
    const customers = await UserModel.aggregate(pipeline);
    const totalRowCount = await UserModel.countDocuments(matchQuery);
    return NextResponse.json({
      success: true,
      data: customers,
      meta: { totalRowCount },
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return catchError(error);
  }
}
