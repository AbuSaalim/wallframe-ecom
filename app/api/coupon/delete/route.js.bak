import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CouponModel from "@/models/Coupon.model";

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

        console.log('PUT /api/coupon/delete - IDs:', ids, 'Type:', deleteType);

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.');
        }

        const data = await CouponModel.find({ _id: { $in: ids } }).lean();
        if (!data.length) {
            return response(false, 404, 'Coupon(s) not found.');
        }

        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid Delete Operation. Delete type should be SD or RSD for this route.');
        }

        if (deleteType === 'SD') {
            // Soft Delete - Move to trash
            await CouponModel.updateMany(
                { _id: { $in: ids } }, 
                { $set: { deletedAt: new Date() } }
            );
            return response(true, 200, `${ids.length} coupon(s) moved to trash.`);
        } else {
            // Restore from trash
            await CouponModel.updateMany(
                { _id: { $in: ids } }, 
                { $set: { deletedAt: null } }
            );
            return response(true, 200, `${ids.length} coupon(s) restored.`);
        }

    } catch (error) {
        console.error('PUT /api/coupon/delete error:', error);
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

        console.log('DELETE /api/coupon/delete - IDs:', ids, 'Type:', deleteType);

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.');
        }

        const data = await CouponModel.find({ _id: { $in: ids } }).lean();
        if (!data.length) {
            return response(false, 404, 'Coupon(s) not found.');
        }

        if (deleteType !== 'PD') {
            return response(false, 400, 'Invalid Delete Operation. Delete type should be PD for this route.');
        }

        // Permanent Delete
        await CouponModel.deleteMany({ _id: { $in: ids } });

        return response(true, 200, `${ids.length} coupon(s) deleted permanently.`);

    } catch (error) {
        console.error('DELETE /api/coupon/delete error:', error);
        return catchError(error);
    }
}
