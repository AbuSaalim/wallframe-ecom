import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import CouponModel from "@/models/Coupon.model";
import { isValidObjectId } from "mongoose";
export async function PUT(request) {
  try {
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response; if (false) {
    }
    await connectDB();
    const payload = await request.json();
    console.log('📝 Update Payload:', payload);
    const schema = LoginSchema.pick({
      _id: true,
      code: true,
      discountPercentage: true,
      minimumShoppingAmount: true,
      validity: true,
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      console.error('❌ Validation errors:', validate.error.errors);
      return response(false, 400, 'Invalid or missing field.', validate.error.errors);
    }
    const { _id, code, discountPercentage, minimumShoppingAmount, validity } = validate.data;
    if (!isValidObjectId(_id)) {
      return response(false, 400, 'Invalid coupon ID.');
    }
    // Check if code already exists (excluding current coupon)
    const existingCoupon = await CouponModel.findOne({
      code,
      _id: { $ne: _id },
      deletedAt: null,
    });
    if (existingCoupon) {
      return response(false, 400, 'Coupon code already exists.');
    }
    const getCoupon = await CouponModel.findOne({ deletedAt: null, _id });
    if (!getCoupon) {
      return response(false, 404, 'Coupon not found.');
    }
    getCoupon.code = code;
    getCoupon.discountPercentage = discountPercentage;
    getCoupon.minimumShoppingAmount = minimumShoppingAmount;
    getCoupon.validity = validity;
    await getCoupon.save();
    console.log('✅ Coupon updated successfully');
    return response(true, 200, 'Coupon updated successfully', getCoupon);
  } catch (error) {
    console.error('PUT /api/coupon/update error:', error);
    return catchError(error);
  }
}
