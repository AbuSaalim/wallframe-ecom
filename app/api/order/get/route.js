import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { authMiddleware } from "@/lib/authMiddleware";
import OrderModel from "@/models/Order.model";
import { NextResponse } from "next/server";

// GET /api/order/get - Get single order by ID
export async function GET(request) {
  try {
    console.log("[ORDER GET API] Request received");
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    console.log("[ORDER GET API] orderId:", orderId);

    if (!orderId) {
      console.log("[ORDER GET API] Validation failed: No orderId");
      return response(false, 400, "Order ID is required", null);
    }

    console.log("[ORDER GET API] Verifying authentication...");
    const auth = await authMiddleware(request, { requireAuth: true });
    if (auth.isError) {
      console.log("[ORDER GET API] Auth failed:", auth.response);
      return auth.response;
    }
    console.log("[ORDER GET API] Auth successful, user:", auth.user.email, "role:", auth.user.role);

    await connectDB();
    console.log("[ORDER GET API] Database connected");

    const order = await OrderModel.findOne({ 
      _id: orderId,
      isDeleted: false 
    })
      .populate('items.product', 'name slug media')
      .populate('items.variant', 'color size sku media')
      .populate('user', 'name email phone')
      .lean();
    
    console.log("[ORDER GET API] Order found:", order ? order.orderId : null);

    if (!order) {
      return response(false, 404, "Order not found", null);
    }

    // Check if user is admin or order owner
    if (auth.user.role !== 'admin' && order.email !== auth.user.email) {
      console.log("[ORDER GET API] Access denied: user is not owner or admin");
      return response(false, 403, "Access denied", null);
    }

    return response(true, 200, "Order fetched successfully", order);
  } catch (error) {
    console.error("[ORDER GET API] error:", error);
    return catchError(error);
  }
}

