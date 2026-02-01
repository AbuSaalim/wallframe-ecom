import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import { NextResponse } from "next/server";
export async function GET(request) {
    try {
        console.log("========== API ROUTE STARTED ==========");
        // Comment out auth temporarily
        // const auth = await isAuthenticated('admin')
        // if (!auth.isAuth) {
        //     return response(false, 403, 'Unauthorized.')
        // }
        console.log("Connecting to database...");
        await connectDB();
        console.log("✓ Database connected");
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page'), 10) || 0;
        const limit = parseInt(searchParams.get('limit'), 10) || 10;
        const deleteType = searchParams.get('deleteType');
        console.log("Query params:", { page, limit, deleteType });
      let filter = {};
if (deleteType === 'SD') {
    filter = {deletedAt: null}; // Changed from deleteAt to deletedAt
} else if(deleteType === 'PD') {
    filter = {deletedAt: {$ne: null}}; // Changed from deleteAt to deletedAt
}
        console.log("Filter:", JSON.stringify(filter));
        console.log("Fetching media data...");
        const mediaData = await MediaModel.find(filter)
            .sort({createdAt: -1})
            .skip(page * limit)
            .limit(limit)
            .lean();
        console.log("✓ Media fetched:", mediaData.length, "items");
        const totalMedia = await MediaModel.countDocuments(filter);
        console.log("✓ Total media count:", totalMedia);
        const responseData = {
            mediaData: mediaData,
            hasMore: ((page + 1) * limit) < totalMedia
        };
        console.log("Sending response:", responseData);
        console.log("========== API ROUTE SUCCESS ==========");
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("========== API ROUTE ERROR ==========");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Full error:", error);
        console.error("======================================");
        // Return error details in development
        return NextResponse.json(
            { 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
