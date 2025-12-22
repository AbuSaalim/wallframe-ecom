import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  minimumShoppingAmount: {
    type: Number,
    required: true,
  },
  validity: {
    type: Date,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true
  },
}, { timestamps: true });

const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema, 'coupons');

export default CouponModel;
