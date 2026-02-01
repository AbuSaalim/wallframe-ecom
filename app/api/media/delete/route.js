import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";
export async function PUT(request) {
    try {
        const auth = await authMiddleware(request, { requireAdmin: true });
        if (auth.isError) return auth.response;
        await connectDB()
        const payload = await request.json()
        const ids = payload.ids || []
        const deleteType = payload.deleteType
        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }
        const media = await MediaModel.find({ _id: { $in: ids }}).lean()
        if (!media.length) {
            return response(false, 404, 'Data not Found')
        }
        if(!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 404, 'Invalid Delete Operation. Delete type Should be SD or RSD for route.')
        }
        if (deleteType === 'SD') {
            await MediaModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: new Date().toISOString() }}) 
        } else {
            await MediaModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null }}) 
        }
        return response(true, 200, deleteType === 'SD'? 'Data moved into trash.' : 'Data restored.')
    } catch (error) {
        return catchError(error)
    }
}
export async function DELETE(request) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response; if (false) {
    }
    await connectDB();
    const payload = await request.json();
    const ids = payload.ids || [];
    const deleteType = payload.deleteType;
    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, 'Invalid or empty id list.');
    }
    const media = await MediaModel.find({ _id: { $in: ids } }).session(session).lean();
    if (!media.length) {
      return response(false, 404, 'Data not Found');
    }
    if (deleteType !== 'PD') {
      return response(false, 404, 'Invalid Delete Operation. Delete type Should be PD for this route.');
    }
    await MediaModel.deleteMany({ _id: { $in: ids } }).session(session);
    // Delete media from Cloudinary safely
    const publicIds = media.map(m => m.public_id).filter(Boolean);
    if (publicIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (error) {
        console.error('Cloudinary deletion failed:', error);
        if (session.inTransaction()) await session.abortTransaction();
        throw error;
      }
    }
    await session.commitTransaction();
    return response(true, 200, 'Data Deleted Permanently.');
  } catch (error) {
    console.error('Delete route error:', error);
    if (session.inTransaction()) await session.abortTransaction();
    return catchError(error);
  } finally {
    session.endSession();
  }
}
