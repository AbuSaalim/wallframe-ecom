import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { authMiddleware } from "@/lib/authMiddleware";
import OrderModel from "@/models/Order.model";

// GET /api/dashboard/orders - Get latest orders for dashboard (admin only)
export async function GET(request) {
  try {
    console.log("[DASHBOARD ORDERS API] Request received");
    
    // Verify Firebase token and admin role
    console.log("[DASHBOARD ORDERS API] Verifying authentication (admin required)...");
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) {
      console.log("[DASHBOARD ORDERS API] Auth failed:", auth.response);
      return auth.response;
    }
    console.log("[DASHBOARD ORDERS API] Auth successful, user:", auth.user.email, "role:", auth.user.role);

    await connectDB();
    console.log("[DASHBOARD ORDERS API] Database connected");
    
    // Fetch latest orders from database
    console.log("[DASHBOARD ORDERS API] Fetching latest orders...");
    const latestOrders = await OrderModel.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId payment status items subtotal total createdAt email')
      .lean();
    
    console.log("[DASHBOARD ORDERS API] Found orders:", latestOrders.length);

    // Transform data for frontend
    const transformedOrders = latestOrders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      paymentId: order.payment?.transactionId || `PAY-${order.orderId.replace('ORD-', '')}`,
      items: order.items?.length || 0,
      status: order.status,
      amount: order.total,
      subtotal: order.subtotal,
      total: order.total,
      email: order.email,
      createdAt: order.createdAt,
      paymentStatus: order.payment?.status || 'pending'
    }));

    console.log("[DASHBOARD ORDERS API] Returning transformed orders:", transformedOrders.length);
    return response(true, 200, "Latest orders fetched successfully", transformedOrders);
  } catch (error) {
    console.error("[DASHBOARD ORDERS API] error:", error);
    return catchError(error);
  }
}
