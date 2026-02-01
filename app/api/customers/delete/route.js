import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";
export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin');
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorised.');
        }
        await connectDB();
        const payload = await request.json();
        const ids = payload.ids || [];
        const deleteType = payload.deleteType;
        console.log('PUT /api/customers/delete - IDs:', ids, 'Type:', deleteType);
        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.');
        }
        const data = await UserModel.find({ _id: { $in: ids } }).lean();
        if (!data.length) {
            return response(false, 404, 'Customer(s) not found.');
        }
        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid Delete Operation. Delete type should be SD or RSD for this route.');
        }
        if (deleteType === 'SD') {
            // Soft Delete - Move to trash
            await UserModel.updateMany(
                { _id: { $in: ids } }, 
                { $set: { deletedAt: new Date() } }
            );
            return response(true, 200, `${ids.length} customer(s) moved to trash.`);
        } else {
            // Restore from trash
            await UserModel.updateMany(
                { _id: { $in: ids } }, 
                { $set: { deletedAt: null } }
            );
            return response(true, 200, `${ids.length} customer(s) restored.`);
        }
    } catch (error) {
        console.error('PUT /api/customers/delete error:', error);
        return catchError(error);
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
        console.log('DELETE /api/customers/delete - IDs:', ids, 'Type:', deleteType);
        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.');
        }
        const data = await UserModel.find({ _id: { $in: ids } }).lean();
        if (!data.length) {
            return response(false, 404, 'Customer(s) not found.');
        }
        if (deleteType !== 'PD') {
            return response(false, 400, 'Invalid Delete Operation. Delete type should be PD for this route.');
        }
        // Permanent Delete
        await UserModel.deleteMany({ _id: { $in: ids } });
        return response(true, 200, `${ids.length} customer(s) deleted permanently.`);
    } catch (error) {
        console.error('DELETE /api/customers/delete error:', error);
        return catchError(error);
    }
}
