import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import CategoryModel from "@/models/Category.model";
export async function POST(request) {
  try {
    // Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();
    const payload = await request.json();
    const schema = LoginSchema.pick({
      name: true,
      slug: true
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, 'Invalid or missing field', validate.error.errors);
    }
    const { name, slug } = validate.data;
    const existingCategory = await CategoryModel.findOne({ slug, deletedAt: null });
    if (existingCategory) {
      return response(false, 400, 'Slug already exists');
    }
    const newCategory = new CategoryModel({ name, slug });
    await newCategory.save();
    return response(true, 201, 'Category added successfully', newCategory);
  } catch (error) {
    return catchError(error);
  }
}
