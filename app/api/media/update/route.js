import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import MediaModel from "@/models/Media.model";
import { isValidObjectId } from "mongoose";
export async function PUT(request) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorised');
    }
    await connectDB();
    const payload = await request.json();
    // Validate using schema
    const schema = LoginSchema.pick({
      _id: true,
      alt: true,
      title: true,
    });
    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, 'Invalid or missing field.', validate.error.errors);
    }
    // Destructure validated data
    const { _id, alt, title } = validate.data;
    if (!isValidObjectId(_id)) {
      return response(false, 400, 'Invalid Object id.');
    }
    const getMedia = await MediaModel.findById(_id);
    if (!getMedia) {
      return response(false, 404, 'Media not found.');
    }
    getMedia.alt = alt;
    getMedia.title = title;
    await getMedia.save();
    return response(true, 200, 'Media updated successfully');
  } catch (error) {
    console.error('API PUT error:', error);
    return catchError(error);
  }
}
