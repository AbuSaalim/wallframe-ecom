import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { authMiddleware } from "@/lib/authMiddleware";
import OrderModel from "@/models/Order.model";
import { NextResponse } from "next/server";

// DELETE /api/order/delete - Soft delete an order (admin only)
export async function DELETE(request) {
  try {
    console.log("[ORDER DELETE API] Request received");
    
    console.log("[ORDER DELETE API] Verifying authentication (admin required)...");
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) {
      console.log("[ORDER DELETE API] Auth failed:", auth.response);
      return auth.response;
    }
    console.log("[ORDER DELETE API] Auth successful, user:", auth.user.email, "role:", auth.user.role);

    await connectDB();
    console.log("[ORDER DELETE API] Database connected");

    const body = await request.json();
    console.log("[ORDER DELETE API] Request body:", Object.keys(body));
    
    const { orderId } = body;

    if (!orderId) {
      console.log("[ORDER DELETE API] Validation failed: No orderId");
      return response(false, 400, "Order ID is required", null);
    }

    console.log("[ORDER DELETE API] Looking for order:", orderId);
    
    const order = await OrderModel.findOne({ 
      _id: orderId,
      isDeleted: false 
    });
    
    console.log("[ORDER DELETE API] Order found:", order ? order.orderId : null);

    if (!order) {
      return response(false, 404, "Order not found", null);
    }

    // Soft delete
    order.isDeleted = true;
    order.deletedAt = new Date();
    
    await order.save();
    console.log("[ORDER DELETE API] Order soft deleted, orderId:", order.orderId);

    return response(true, 200, "Order deleted successfully", null);
  } catch (error) {
    console.error("[ORDER DELETE API] error:", error);
    return catchError(error);
  }
}

