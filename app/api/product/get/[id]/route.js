import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import { isValidObjectId } from "mongoose";
export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const { id } = await params;
    console.log('🔍 Fetching product with ID:', id);
    if (!isValidObjectId(id)) {
      return response(false, 400, 'Invalid product ID.');
    }
    const getProduct = await ProductModel.findOne({ _id: id, deletedAt: null })
      .populate('category', 'name _id')
      .populate('media', 'secure_url _id alt');
    console.log('📦 Found product:', getProduct);
    if (!getProduct) {
      return response(false, 404, 'Product not found.');
    }
    return response(true, 200, 'Product found.', getProduct);
  } catch (error) {
    console.error('GET /api/product/get/[id] error:', error);
    return catchError(error);
  }
}
