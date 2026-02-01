import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CouponModel from "@/models/Coupon.model";
import { isValidObjectId } from "mongoose";
export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const { id } = await params;
    console.log('🔍 Fetching Coupon with ID:', id);
    if (!isValidObjectId(id)) {
      return response(false, 400, 'Invalid Coupon ID.');
    }
    const getCoupon = await CouponModel.findOne({ _id: id, deletedAt: null })
      .lean();
    console.log('📝 Fetched Coupon:', getCoupon);
    if (!getCoupon) {
      return response(false, 404, 'Coupon not found.');
    }
    return response(true, 200, 'Coupon found.', getCoupon);
  } catch (error) {
    console.error('GET /api/coupon/get/[id] error:', error);
    return catchError(error);
  }
}
