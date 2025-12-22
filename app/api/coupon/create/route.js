import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import CouponModel from "@/models/Coupon.model";

export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();
    const payload = await request.json();

    console.log('📝 Create Coupon Payload:', payload);

    const schema = LoginSchema.pick({
      code: true,
      discountPercentage: true,
      minimumShoppingAmount: true,
      validity: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      console.error('❌ Validation errors:', validate.error.errors);
      return response(
        false,
        400,
        "Invalid or missing field",
        validate.error.errors
      );
    }

    const couponData = validate.data;

    // Check if coupon code already exists
    const existingCoupon = await CouponModel.findOne({
      code: couponData.code,
      deletedAt: null
    });

    if (existingCoupon) {
      return response(false, 400, 'Coupon code already exists.');
    }

    const newCoupon = new CouponModel({
      code: couponData.code,
      discountPercentage: couponData.discountPercentage,
      minimumShoppingAmount: couponData.minimumShoppingAmount,
      validity: couponData.validity,
    });

    await newCoupon.save();

    console.log('✅ Coupon created successfully');

    return response(true, 201, "Coupon added successfully", newCoupon);
  } catch (error) {
    console.error('POST /api/coupon/create error:', error);
    return catchError(error);
  }
}
