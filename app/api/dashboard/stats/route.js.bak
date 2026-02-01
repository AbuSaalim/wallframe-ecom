import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
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

    // Get counts with error handling
    let totalCategories = 0;
    let totalProducts = 0;
    let totalCustomers = 0;
    let totalOrders = 1250; // Placeholder until Order model

    try {
      totalCategories = await CategoryModel.countDocuments({ deletedAt: null });
    } catch (err) {
      console.error("Error counting categories:", err);
    }

    try {
      totalProducts = await ProductModel.countDocuments({ deletedAt: null });
    } catch (err) {
      console.error("Error counting products:", err);
    }

    try {
      totalCustomers = await UserModel.countDocuments({ 
        role: 'user', 
        deletedAt: null 
      });
    } catch (err) {
      console.error("Error counting customers:", err);
    }

    const stats = {
      totalCategories,
      totalProducts,
      totalCustomers,
      totalOrders,
    };

    return response(true, 200, "Stats fetched successfully", stats);
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return catchError(error);
  }
}
