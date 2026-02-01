import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";
export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const deleteType = searchParams.get('deleteType') || 'SD';
    // Build filter based on delete type
    let filter = {};
    if (deleteType === 'SD') {
      filter.deletedAt = null;
    } else if (deleteType === 'PD') {
      filter.deletedAt = { $ne: null };
    }
    const getReview = await ReviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
    if (!getReview || getReview.length === 0) {
      return response(false, 404, 'Collection empty.');
    }
    return response(true, 200, 'Data found.', getReview);
  } catch (error) {
    console.error('GET /api/review/export error:', error);
    return catchError(error);
  }
}
