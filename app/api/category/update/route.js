import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import CategoryModel from "@/models/Category.model";
import { isValidObjectId } from "mongoose";  // ✅ Add this import
export async function PUT(request) {
  try {
    // Check authentication
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;
    await connectDB();
    const payload = await request.json();
    const schema = LoginSchema.pick({
      _id: true,
      name: true,
      slug: true
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, 'Invalid or missing field.', validate.error.errors);
    }
    const { _id, name, slug } = validate.data;
    // ✅ Add validation for ObjectId
    if (!isValidObjectId(_id)) {
      return response(false, 400, 'Invalid category ID.');
    }
    // ✅ Check if slug already exists (excluding current category)
    const existingCategory = await CategoryModel.findOne({ 
      slug, 
      _id: { $ne: _id },
      deletedAt: null 
    });
    if (existingCategory) {
      return response(false, 400, 'Slug already exists');
    }
    // ✅ Find category
    const getCategory = await CategoryModel.findOne({ deletedAt: null, _id });
    if (!getCategory) {
      return response(false, 404, 'Category not found.');  // ✅ Changed to 404
    }
    // ✅ FIXED: You forgot to assign the values!
    getCategory.name = name;   // ❌ You wrote: getCategory.name (without assignment)
    getCategory.slug = slug;   // ❌ You wrote: getCategory.slug (without assignment)
    await getCategory.save();
    // ✅ FIXED: Return getCategory, not newCategory (which doesn't exist)
    return response(true, 200, 'Category updated successfully', getCategory);  // Changed 201 to 200
  } catch (error) {
    console.error('PUT /api/category/update error:', error);
    return catchError(error);
  }
}
