import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
export async function GET(request) {
  try {
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response; if (false) {
    }
    await connectDB();
    const filter = {
        deletedAt: null
    }
    const getCategory = await CategoryModel.find(filter).sort({createdAt:-1}).lean()
    if (!getCategory) {
          return response(false, 404, 'Collection empty.');
    }
    return response(true, 200, 'Data found.', getCategory);
  } catch (error) {
    console.error('GET /api/category/get/[id] error:', error);
    return catchError(error);
  }
}
