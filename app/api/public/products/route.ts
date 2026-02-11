import { connectDB } from "@/lib/detabaseConnection";
import { catchError } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import CategoryModel from "@/models/Category.model"; // Ensure Category is registered
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        await connectDB();

        // Register models to ensure population works
        // (Mongoose sometimes needs this if models haven't been compiled yet)
        if (!MediaModel) console.log("MediaModel needed for population");
        if (!CategoryModel) console.log("CategoryModel needed for population");

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '8', 10);
        const featured = searchParams.get('featured') === 'true';

        // Build query
        const query: any = { deletedAt: null };

        // If we had a "featured" flag in schema we would use it, 
        // for now we just return latest products.

        const products = await ProductModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('category', 'name slug')
            .populate('media', 'secure_url alt title')
            .lean();

        return NextResponse.json({
            success: true,
            data: products,
            count: products.length
        });

    } catch (error: any) {
        return catchError(error);
    }
}
