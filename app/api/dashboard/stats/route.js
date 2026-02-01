import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/detabaseConnection";
import { response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    // Get counts
    const totalCategories = await CategoryModel.countDocuments({ deletedAt: null });
    const totalProducts = await ProductModel.countDocuments({ deletedAt: null });
    const totalCustomers = await UserModel.countDocuments({ role: 'user', deletedAt: null });
    
    // Estimate orders count (we can adjust based on your Order model)
    const totalOrders = 1250; // Placeholder - adjust when Order model is created

    const stats = {
      totalCategories,
      totalProducts,
      totalCustomers,
      totalOrders,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Stats fetched successfully",
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { success: false, message: error.message, statusCode: 500 },
      { status: 500 }
    );
  }
}
