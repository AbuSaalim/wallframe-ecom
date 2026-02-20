import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { authMiddleware } from "@/lib/authMiddleware";
import OrderModel from "@/models/Order.model";
import { NextResponse } from "next/server";

// PUT /api/order/update - Update order status or details
export async function PUT(request) {
  try {
    console.log("[ORDER UPDATE API] Request received");
    
    console.log("[ORDER UPDATE API] Verifying authentication...");
    const auth = await authMiddleware(request, { requireAuth: true });
    if (auth.isError) {
      console.log("[ORDER UPDATE API] Auth failed:", auth.response);
      return auth.response;
    }
    console.log("[ORDER UPDATE API] Auth successful, user:", auth.user.email, "role:", auth.user.role);

    await connectDB();
    console.log("[ORDER UPDATE API] Database connected");

    const body = await request.json();
    console.log("[ORDER UPDATE API] Request body:", Object.keys(body));
    
    const { orderId, status, trackingNumber, notes, cancellationReason } = body;

    if (!orderId) {
      console.log("[ORDER UPDATE API] Validation failed: No orderId");
      return response(false, 400, "Order ID is required", null);
    }

    console.log("[ORDER UPDATE API] Looking for order:", orderId);
    
    const order = await OrderModel.findOne({ 
      _id: orderId,
      isDeleted: false 
    });

    console.log("[ORDER UPDATE API] Order found:", order ? order.orderId : null);

    if (!order) {
      return response(false, 404, "Order not found", null);
    }

    // Only admin can update orders
    if (auth.user.role !== 'admin') {
      // Regular users can only cancel their own pending orders
      if (status === 'cancelled' && order.status === 'pending' && order.email === auth.user.email) {
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = cancellationReason || 'Cancelled by customer';
        console.log("[ORDER UPDATE API] User cancelled their pending order");
      } else {
        return response(false, 403, "You can only cancel pending orders", null);
      }
    } else {
      // Admin can update status
      if (status) {
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        
        if (!validStatuses.includes(status)) {
          return response(false, 400, "Invalid status", null);
        }

        // Prevent cancelling already delivered orders
        if (order.status === 'delivered' && status === 'cancelled') {
          return response(false, 400, "Cannot cancel delivered orders", null);
        }
        
        console.log("[ORDER UPDATE API] Admin updating status from", order.status, "to", status);

        order.status = status;

        // Set timestamps based on status
        if (status === 'shipped') {
          order.shippedAt = new Date();
          if (trackingNumber) {
            order.trackingNumber = trackingNumber;
          }
        } else if (status === 'delivered') {
          order.deliveredAt = new Date();
        } else if (status === 'cancelled') {
          order.cancelledAt = new Date();
          order.cancellationReason = cancellationReason || 'Cancelled by admin';
        }
      }

      // Admin can update tracking number
      if (trackingNumber !== undefined) {
        order.trackingNumber = trackingNumber;
      }

      // Admin can add notes
      if (notes !== undefined) {
        order.notes = notes;
      }
    }

    await order.save();
    console.log("[ORDER UPDATE API] Order saved, new status:", order.status);

    // Populate and return updated order
    const updatedOrder = await OrderModel.findById(order._id)
      .populate('items.product', 'name slug')
      .populate('items.variant', 'color size sku')
      .lean();

    return response(true, 200, "Order updated successfully", updatedOrder);
  } catch (error) {
    console.error("[ORDER UPDATE API] error:", error);
    return catchError(error);
  }
}

