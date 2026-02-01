import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CouponModel from "@/models/Coupon.model";
import { z } from "zod";

/**
 * POST /api/coupon/create
 * 
 * Creates a new discount coupon with Firebase auth verification.
 * 
 * Headers:
 *   Authorization: Bearer <firebaseIdToken>
 * 
 * Request Body:
 *   {
 *     "code": "SUMMER20",
 *     "discountPercentage": 20,
 *     "minimumShoppingAmount": 1000,
 *     "validity": "2025-08-31T23:59:59Z"
 *   }
 * 
 * Returns: { success, statusCode, message, data: coupon }
 */
export async function POST(request) {
  try {
    // Step 1: Verify Firebase token and check admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;
    // If we reach here, user is authenticated and admin verified ✅

    // Step 2: Connect to database
    await connectDB();

    // Step 3: Extract and parse request body
    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return response(false, 400, 'Invalid JSON in request body');
    }

    console.log('📝 Create Coupon Payload:', payload);

    // Step 4: Validate request body with Zod schema
    const couponCreateSchema = z.object({
      code: z
        .string()
        .min(1, 'Coupon code is required')
        .min(3, 'Coupon code must be at least 3 characters')
        .max(50, 'Coupon code must not exceed 50 characters')
        .toUpperCase()
        .trim()
        .regex(/^[A-Z0-9\-]+$/, 'Coupon code can only contain uppercase letters, numbers, and hyphens'),
      
      discountPercentage: z
        .number({ invalid_type_error: 'Discount percentage must be a number' })
        .min(0, 'Discount percentage cannot be negative')
        .max(100, 'Discount percentage cannot exceed 100'),
      
      minimumShoppingAmount: z
        .number({ invalid_type_error: 'Minimum shopping amount must be a number' })
        .positive('Minimum shopping amount must be greater than 0'),
      
      validity: z
        .string()
        .datetime({ message: 'Validity must be a valid ISO 8601 date' })
        .refine(
          (val) => new Date(val) > new Date(),
          { message: 'Validity date must be in the future' }
        ),
    });

    const validate = couponCreateSchema.safeParse(payload);
    if (!validate.success) {
      // Return validation errors with proper formatting
      const errors = validate.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      console.error('❌ Validation errors:', errors);
      return response(false, 400, 'Validation failed', errors);
    }

    const couponData = validate.data;

    // Step 5: Check if coupon code already exists
    const existingCoupon = await CouponModel.findOne({
      code: couponData.code,
      deletedAt: null
    });
    if (existingCoupon) {
      return response(false, 400, `Coupon code "${couponData.code}" already exists`);
    }

    // Step 6: Create new coupon document
    const newCoupon = new CouponModel({
      code: couponData.code,
      discountPercentage: couponData.discountPercentage,
      minimumShoppingAmount: couponData.minimumShoppingAmount,
      validity: new Date(couponData.validity),
      // deletedAt defaults to null (not soft deleted)
    });

    // Step 7: Save to MongoDB
    await newCoupon.save();
    console.log('✅ Coupon created successfully');

    // Step 8: Return success response with created coupon
    return response(true, 201, 'Coupon created successfully', {
      _id: newCoupon._id,
      code: newCoupon.code,
      discountPercentage: newCoupon.discountPercentage,
      minimumShoppingAmount: newCoupon.minimumShoppingAmount,
      validity: newCoupon.validity,
      createdAt: newCoupon.createdAt,
      updatedAt: newCoupon.updatedAt,
    });
  } catch (error) {
    console.error('POST /api/coupon/create error:', error);
    return catchError(error);
  }
}
