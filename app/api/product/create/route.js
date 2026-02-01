import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import ProductModel from "@/models/Product.model";
import { encode } from "entities";
export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }
    await connectDB();
    const payload = await request.json();
    const schema = LoginSchema.pick({
      name: true,
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      description: true,
      media: true,
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(
        false,
        400,
        "Invalid or missing field",
        validate.error.errors
      );
    }
    const productData = validate.data;
    const newProduct = new ProductModel({
      name: productData.name,
      slug: productData.slug,
      category: productData.category,
      mrp: productData.mrp,
      sellingPrice: productData.sellingPrice,
      discountPercentage: productData.discountPercentage,
      description: encode(productData.description),
      media: productData.media,
    });
    await newProduct.save();
    return response(true, 201, "Product added successfully", newProduct);
  } catch (error) {
    return catchError(error);
  }
}
