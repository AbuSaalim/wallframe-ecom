import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";
export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }
    await connectDB();
    // Fetch latest reviews with product and user information
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
          _id: 1,
          productName: "$productData.name",
          productImage: "$productData.image",
          userName: "$userData.name",
          rating: 1,
          review: 1,
          title: 1,
          createdAt: 1,
        },
      },
    ]);
    return response(true, 200, "Latest reviews fetched successfully", latestReviews);
  } catch (error) {
    console.error("GET /api/dashboard/reviews error:", error);
    return catchError(error);
  }
}
