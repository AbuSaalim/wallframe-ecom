import { connectDB } from "@/lib/detabaseConnection";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import CategoryModel from "@/models/Category.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";

/**
 * Fetches a product by slug with all related data (variants, reviews).
 * Connects to DB if not connected.
 */
export async function getProductBySlug(slug: string) {
    try {
        console.log(`[getProductBySlug] Fetching product for slug: ${slug}`);
        await connectDB();

        // Register models
        if (!MediaModel) console.log("MediaModel needed for population");
        if (!CategoryModel) console.log("CategoryModel needed for population");
        if (!ProductVariantModel) console.log("ProductVariantModel needed for lookup");
        if (!ReviewModel) console.log("ReviewModel needed for pipeline");

        // 1. Fetch Product
        const product = await ProductModel.findOne({ slug, deletedAt: null })
            .populate('category', 'name slug')
            .populate('media', 'secure_url alt title')
            .lean();

        if (!product) {
            console.log(`[getProductBySlug] Product not found for slug: ${slug}`);
            return null;
        }

        console.log(`[getProductBySlug] Found product: ${product._id}`);

        // 2. Fetch Variants
        const variants = await ProductVariantModel.find({ product: product._id, deletedAt: null })
            .populate('media', 'secure_url alt title')
            .lean();

        console.log(`[getProductBySlug] Found ${variants.length} variants`);

        // 3. Aggregate Reviews
        const reviewAgg = await ReviewModel.aggregate([
            { $match: { product: product._id, deletedAt: null } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const stats = reviewAgg.length > 0 ? reviewAgg[0] : { averageRating: 0, totalReviews: 0 };

        // Combine data
        const productData = {
            ...product,
            variants,
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews
        };

        return JSON.parse(JSON.stringify(productData));

    } catch (error) {
        console.error("Error in getProductBySlug:", error);
        throw error;
    }
}
