import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
import { isValidObjectId } from "mongoose";
export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return response(false, 400, 'Invalid category ID.');
    }
    const category = await CategoryModel.findOne({ _id: id, deletedAt: null });
    if (!category) {
      return response(false, 404, 'Category not found.');
    }
    return response(true, 200, 'Category found.', category);
  } catch (error) {
    console.error('GET /api/category/get/[id] error:', error);
    return catchError(error);
  }
}
