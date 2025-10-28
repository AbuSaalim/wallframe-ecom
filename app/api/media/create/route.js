import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, isAuthenticated, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  let payload = null;
  
  try {
    // Check authentication
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }

    // Parse request body
    payload = await request.json();
    
    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return response(false, 400, 'Invalid payload.');
    }

    // Connect to database
    await connectDB();

    // Insert media records
    const newMedia = await MediaModel.insertMany(payload);
    return response(true, 200, 'Media uploaded successfully.', newMedia);

  } catch (error) {
    console.error('Media creation error:', error);

    // Rollback: Delete uploaded files from Cloudinary if DB insert fails
    if (payload && Array.isArray(payload) && payload.length > 0) {
      const publicIds = payload.map(data => data.public_id); // Fixed: was DataTransfer.public_id

      try {
        await cloudinary.api.delete_resources(publicIds); // Fixed: was cloudinaryLoader
        console.log('Rolled back Cloudinary uploads:', publicIds);
      } catch (deleteError) {
        console.error('Failed to rollback:', deleteError);
        error.cloudinary = deleteError;
      }
    }

    return catchError(error); // Fixed: Added return statement
  }
}
