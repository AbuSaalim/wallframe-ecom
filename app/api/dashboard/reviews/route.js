import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";
import { authMiddleware } from "@/lib/authMiddleware";

export async function GET(request) {
  try {
    // 🔐 Firebase Auth check - verify admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();
    
    // 📊 Fetch latest reviews with product and user information
    const latestReviews = await ReviewModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: {
          path: "$productData",
          preserveAndEmptyArrays: true,
        },
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
        $unwind: {
          path: "$userData",
          preserveAndEmptyArrays: true,
        },
      },
      { $match: { deletedAt: null } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: { $toString: "$_id" },
          productName: {
            $ifNull: ["$productData.name", "Unknown Product"],
          },
          productImage: {
            $ifNull: ["$productData.image", ""],
          },
          userName: {
            $ifNull: ["$userData.name", "Unknown User"],
          },
          rating: { $ifNull: ["$rating", 0] },
          review: { $ifNull: ["$review", ""] },
          title: { $ifNull: ["$title", ""] },
          createdAt: { $ifNull: ["$createdAt", new Date()] },
        },
      },
    ]);

    return response(
      true,
      200,
      "Latest reviews fetched successfully",
      latestReviews || []
    );
  } catch (error) {
    console.error("GET /api/dashboard/reviews error:", error);
    return catchError(error);
  }
}
