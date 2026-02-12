import { getProductBySlug } from "@/lib/actions/product";
import { catchError } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    try {
        const slug = params.slug;
        const productData = await getProductBySlug(slug);

        if (!productData) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: productData
        });

    } catch (error: any) {
        return catchError(error);
    }
}
