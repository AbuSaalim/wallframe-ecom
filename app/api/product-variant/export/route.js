import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";
export async function GET(request) {
  try {
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response; if (false) {
    }
    await connectDB();
    const filter = {
        deletedAt: null
    }
    const getProductVariant = await ProductVariantModel.find(filter).select('-media -description').sort({createdAt:-1}).lean()
    if (!getProductVariant) {
          return response(false, 404, 'Collection empty.');
    }
    return response(true, 200, 'Data found.', getProductVariant);
  } catch (error) {
    console.error('GET /api/category/get/[id] error:', error);
    return catchError(error);
  }
}
