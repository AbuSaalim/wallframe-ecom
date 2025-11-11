import { connectDB } from "@/lib/detabaseConnection";
import { catchError, isAuthenticated, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import { isValidObjectId } from "mongoose";

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated('admin');
    
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorised');
    }

    await connectDB();

    const id = params.id;

    if (!isValidObjectId(id)) {
      return response(false, 400, 'Invalid object id.');
    }

    const media = await MediaModel.findOne({ _id: id, deletedAt: null }).lean();

    if (!media) {
      return response(false, 404, 'Media not found.');
    }

    return response(true, 200, 'Media found.', media);
    
  } catch (error) {
    console.error('API GET error:', error);
    return catchError(error);
  }
}
