import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
import { z } from "zod";

/**
 * POST /api/category/create
 * 
 * Creates a new product category with Firebase auth verification.
 * 
 * Headers:
 *   Authorization: Bearer <firebaseIdToken>
 * 
 * Request Body:
 *   {
 *     "name": "Electronics",
 *     "slug": "electronics"
 *   }
 * 
 * Returns: { success, statusCode, message, data: category }
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

    // Step 4: Validate request body with Zod schema
    const categoryCreateSchema = z.object({
      name: z
        .string()
        .min(1, 'Category name is required')
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name must not exceed 100 characters')
        .trim(),
      slug: z
        .string()
        .min(1, 'Slug is required')
        .min(2, 'Slug must be at least 2 characters')
        .max(100, 'Slug must not exceed 100 characters')
        .toLowerCase()
        .trim()
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    });

    const validate = categoryCreateSchema.safeParse(payload);
    if (!validate.success) {
      // Return validation errors with proper formatting
      const errors = validate.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return response(false, 400, 'Validation failed', errors);
    }

    const { name, slug } = validate.data;

    // Step 5: Check if category with this slug already exists
    const existingCategory = await CategoryModel.findOne({ 
      slug, 
      deletedAt: null 
    });
    if (existingCategory) {
      return response(false, 400, `Category with slug "${slug}" already exists`);
    }

    // Step 6: Create new category document
    const newCategory = new CategoryModel({
      name,
      slug,
      // deletedAt defaults to null (not soft deleted)
    });

    // Step 7: Save to MongoDB
    await newCategory.save();

    // Step 8: Return success response with created category
    return response(true, 201, 'Category created successfully', {
      _id: newCategory._id,
      name: newCategory.name,
      slug: newCategory.slug,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt,
    });
  } catch (error) {
    console.error('POST /api/category/create error:', error);
    return catchError(error);
  }
}
