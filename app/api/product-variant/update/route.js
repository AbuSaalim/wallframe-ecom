import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import ProductVariantModel from "@/models/ProductVariant.model";
import { isValidObjectId } from "mongoose";
export async function PUT(request) {
  try {
    // Check authentication
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response; if (false) {
    }
    await connectDB();
    const payload = await request.json();
    console.log("📝 Update Payload:", payload);
    const schema = LoginSchema.pick({
      _id: true,
      product: true,
      sku: true,
      color: true,
      size: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      media: true,
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      console.error("❌ Validation errors:", validate.error.errors);
      return response(
        false,
        400,
        "Invalid or missing field.",
        validate.error.errors
      );
    }
    const {
      _id,
      sku,
      product,
      color,
      size,
      mrp,
      sellingPrice,
      discountPercentage,
      description,
    } = validate.data;
    // Validate ObjectId
    if (!isValidObjectId(_id)) {
      return response(false, 400, "Invalid product ID.");
    }
    // Check if slug already exists (excluding current product)
    const existingProduct = await ProductVariantModel.findOne({
      slug,
      _id: { $ne: _id },
      deletedAt: null,
    });
    if (existingProduct) {
      return response(false, 400, "Slug already exists");
    }
    // Find product
    const getProductVariant = await ProductVariantModel.findOne({ deletedAt: null, _id });
    if (!getProductVariant) {
      return response(false, 404, "Product not found.");
    }
    // Update fields
    getProductVariant.product = product;
    getProductVariant.color = color;
    getProductVariant.size = size;
    getProductVariant.sku = sku;
    getProductVariant.mrp = mrp;
    getProductVariant.sellingPrice = sellingPrice;
    getProductVariant.discountPercentage = discountPercentage;
    getProductVariant.description = description;
    // Update media if provided
    if (payload.media && Array.isArray(payload.media)) {
      getProductVariant.media = payload.media;
    }
    await getProductVariant.save();
    console.log("✅ Product variant updated successfully");
    return response(true, 200, "Product variant updated successfully", getProductVariant);
  } catch (error) {
    console.error("PUT /api/product/update error:", error);
    return catchError(error);
  }
}
