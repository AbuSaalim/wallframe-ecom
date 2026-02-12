import { connectDB } from "@/lib/detabaseConnection";
import { catchError } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        await connectDB();

        // Fetch only non-deleted categories, sorted by name
        const categories = await CategoryModel.find({ deletedAt: null })
            .select('name slug')
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: categories,
            count: categories.length
        });

    } catch (error: any) {
        return catchError(error);
    }
}
