import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorised.')
        }
        await connectDB()
        const payload = await request.json()
        const ids = payload.ids || []
        const deleteType = payload.deleteType
        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }
        const data = await ProductModel.find({ _id: { $in: ids }}).lean()
        if (!data.length) {
            return response(false, 404, 'Data not Found')
        }
        if(!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 404, 'Invalid Delete Operation. Delete type Should be SD or RSD for route.')
        }
        if (deleteType === 'SD') {
            await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: new Date().toISOString() }}) 
        } else {
            await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null }}) 
        }
        return response(true, 200, deleteType === 'SD'? 'Data moved into trash.' : 'Data restored.')
    } catch (error) {
        return catchError(error)
    }
}
export async function DELETE(request) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorised.');
    }
    await connectDB();
    const payload = await request.json();
    const ids = payload.ids || [];
    const deleteType = payload.deleteType;
    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, 'Invalid or empty id list.');
    }
    const data = await ProductModel.find({ _id: { $in: ids } }).lean();
    if (!data.length) {
      return response(false, 404, 'Data not Found');
    }
    if (deleteType !== 'PD') {
      return response(false, 404, 'Invalid Delete Operation. Delete type Should be PD for this route.');
    }
    await ProductModel.deleteMany({ _id: { $in: ids } });
    return response(true, 200, 'Data Deleted Permanently.');
  } catch (error) {
    return catchError(error);
  } 
}
