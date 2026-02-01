import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import ProductModel from "@/models/Product.model";
import { isValidObjectId } from "mongoose";
export async function PUT(request) {
  try {
    // Check authentication
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const payload = await request.json();
    console.log('📝 Update Payload:', payload);
    const schema = LoginSchema.pick({
      _id: true,
      name: true,
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      description: true,
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      console.error('❌ Validation errors:', validate.error.errors);
      return response(false, 400, 'Invalid or missing field.', validate.error.errors);
    }
    const { _id, name, slug, category, mrp, sellingPrice, discountPercentage, description } = validate.data;
    // Validate ObjectId
    if (!isValidObjectId(_id)) {
      return response(false, 400, 'Invalid product ID.');
    }
    // Check if slug already exists (excluding current product)
    const existingProduct = await ProductModel.findOne({ 
      slug, 
      _id: { $ne: _id },
      deletedAt: null 
    });
    if (existingProduct) {
      return response(false, 400, 'Slug already exists');
    }
    // Find product
    const getProduct = await ProductModel.findOne({ deletedAt: null, _id });
    if (!getProduct) {
      return response(false, 404, 'Product not found.');
    }
    // Update fields
    getProduct.name = name;
    getProduct.slug = slug;
    getProduct.category = category;
    getProduct.mrp = mrp;
    getProduct.sellingPrice = sellingPrice;
    getProduct.discountPercentage = discountPercentage;
    getProduct.description = description;
    // Update media if provided
    if (payload.media && Array.isArray(payload.media)) {
      getProduct.media = payload.media;
    }
    await getProduct.save();
    console.log('✅ Product updated successfully');
    return response(true, 200, 'Product updated successfully', getProduct);
  } catch (error) {
    console.error('PUT /api/product/update error:', error);
    return catchError(error);
  }
}
