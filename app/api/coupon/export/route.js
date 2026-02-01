import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CouponModel from "@/models/Coupon.model";
export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const deleteType = searchParams.get('deleteType') || 'SD';
    // Build filter based on delete type
    let filter = {};
    if (deleteType === 'SD') {
      filter.deletedAt = null;
    } else if (deleteType === 'PD') {
      filter.deletedAt = { $ne: null };
    }
    const getCoupons = await CouponModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
    if (!getCoupons || getCoupons.length === 0) {
      return response(false, 404, 'Collection empty.');
    }
    return response(true, 200, 'Data found.', getCoupons);
  } catch (error) {
    console.error('GET /api/coupon/export error:', error);
    return catchError(error);
  }
}
