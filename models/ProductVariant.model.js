import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    media: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
        required: true,
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Option A: expire exactly at deletedAt time (you must set deletedAt as a Date in the future or now)
productVariantSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 });

const ProductVariantModel =
  mongoose.models.ProductVariant ||
  mongoose.model("ProductVariant", productVariantSchema, "productVariants");
export default ProductVariantModel;