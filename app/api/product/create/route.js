import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import { encode } from "entities";
import { z } from "zod";

/**
 * POST /api/product/create
 * 
 * Creates a new product with Firebase auth verification.
 * 
 * Headers:
 *   Authorization: Bearer <firebaseIdToken>
 * 
 * Request Body:
 *   {
 *     "name": "MacBook Pro",
 *     "slug": "macbook-pro",
 *     "category": "507f1f77bcf86cd799439011",
 *     "mrp": 129999,
 *     "sellingPrice": 99999,
 *     "discountPercentage": 23,
 *     "description": "High-end laptop",
 *     "media": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *   }
 * 
 * Returns: { success, statusCode, message, data: product }
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
    const productCreateSchema = z.object({
      name: z
        .string()
        .min(1, 'Product name is required')
        .min(2, 'Product name must be at least 2 characters')
        .max(200, 'Product name must not exceed 200 characters')
        .trim(),
      
      slug: z
        .string()
        .min(1, 'Slug is required')
        .min(2, 'Slug must be at least 2 characters')
        .max(200, 'Slug must not exceed 200 characters')
        .toLowerCase()
        .trim()
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
      
      category: z
        .string()
        .min(1, 'Category is required')
        .regex(/^[a-f0-9]{24}$/, 'Category must be a valid MongoDB ID'),
      
      mrp: z
        .number({ invalid_type_error: 'MRP must be a number' })
        .positive('MRP must be greater than 0'),
      
      sellingPrice: z
        .number({ invalid_type_error: 'Selling price must be a number' })
        .positive('Selling price must be greater than 0'),
      
      discountPercentage: z
        .number({ invalid_type_error: 'Discount percentage must be a number' })
        .min(0, 'Discount percentage cannot be negative')
        .max(100, 'Discount percentage cannot exceed 100'),
      
      description: z
        .string()
        .min(1, 'Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must not exceed 5000 characters'),
      
      media: z
        .array(z.string().regex(/^[a-f0-9]{24}$/, 'Each media ID must be a valid MongoDB ID'))
        .min(1, 'At least one media item is required'),
    });

    const validate = productCreateSchema.safeParse(payload);
    if (!validate.success) {
      // Return validation errors with proper formatting
      const errors = validate.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return response(false, 400, 'Validation failed', errors);
    }

    const productData = validate.data;

    // Step 5: Check if product slug already exists
    const existingProduct = await ProductModel.findOne({
      slug: productData.slug,
      deletedAt: null
    });
    if (existingProduct) {
      return response(false, 400, `Product with slug "${productData.slug}" already exists`);
    }

    // Step 6: Verify selling price <= MRP
    if (productData.sellingPrice > productData.mrp) {
      return response(false, 400, 'Selling price cannot be greater than MRP');
    }

    // Step 7: Create new product document
    const newProduct = new ProductModel({
      name: productData.name,
      slug: productData.slug,
      category: productData.category,
      mrp: productData.mrp,
      sellingPrice: productData.sellingPrice,
      discountPercentage: productData.discountPercentage,
      description: encode(productData.description),
      media: productData.media,
      // deletedAt defaults to null (not soft deleted)
    });

    // Step 8: Save to MongoDB
    await newProduct.save();

    // Step 9: Return success response with created product
    return response(true, 201, 'Product created successfully', {
      _id: newProduct._id,
      name: newProduct.name,
      slug: newProduct.slug,
      category: newProduct.category,
      mrp: newProduct.mrp,
      sellingPrice: newProduct.sellingPrice,
      discountPercentage: newProduct.discountPercentage,
      description: newProduct.description,
      media: newProduct.media,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
    });
  } catch (error) {
    console.error('POST /api/product/create error:', error);
    return catchError(error);
  }
}
