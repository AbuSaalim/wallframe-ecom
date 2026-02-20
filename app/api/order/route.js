import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { authMiddleware } from "@/lib/authMiddleware";
import OrderModel from "@/models/Order.model";
import { NextResponse } from "next/server";

// GET /api/order - Get orders (admin gets all, user gets their own)
export async function GET(request) {
  try {
    console.log("[ORDER API] GET /api/order - Request received");
    console.log("[ORDER API] URL:", request.url);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const userEmail = searchParams.get('email'); // For filtering by user email

    console.log("[ORDER API] Query params:", { page, limit, status, userEmail });

    // First check auth to determine if admin or regular user
    console.log("[ORDER API] Verifying authentication...");
    const auth = await authMiddleware(request, { requireAuth: true });
    if (auth.isError) {
      console.log("[ORDER API] Auth failed:", auth.response);
      return auth.response;
    }
    console.log("[ORDER API] Auth successful, user:", auth.user.email, "role:", auth.user.role);

    await connectDB();
    console.log("[ORDER API] Database connected");

    const query = { isDeleted: false };

    // If not admin, only show own orders
    if (auth.user.role !== 'admin') {
      // For regular users, we need to find by email since firebaseUid might not match
      query.email = auth.user.email;
      console.log("[ORDER API] Regular user, filtering by email:", auth.user.email);
    }

    // Admin filters
    if (status) {
      query.status = status;
      console.log("[ORDER API] Filtering by status:", status);
    }

    if (userEmail && auth.user.role === 'admin') {
      query.email = userEmail;
      console.log("[ORDER API] Admin filtering by user email:", userEmail);
    }

    const skip = (page - 1) * limit;
    console.log("[ORDER API] Query:", JSON.stringify(query));
    console.log("[ORDER API] Pagination:", { skip, limit });

    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query)
    ]);

    console.log("[ORDER API] Found orders:", orders.length, "total:", total);

    return response(
      true,
      200,
      "Orders fetched successfully",
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    );
  } catch (error) {
    console.error("[ORDER API] GET /api/order error:", error);
    return catchError(error);
  }
}

// POST /api/order - Create new order
export async function POST(request) {
  try {
    console.log("[ORDER API] POST /api/order - Request received");
    
    console.log("[ORDER API] Verifying authentication...");
    const auth = await authMiddleware(request, { requireAuth: true });
    if (auth.isError) {
      console.log("[ORDER API] Auth failed:", auth.response);
      return auth.response;
    }
    console.log("[ORDER API] Auth successful, user:", auth.user.email, "role:", auth.user.role);

    await connectDB();
    console.log("[ORDER API] Database connected");

    const body = await request.json();
    console.log("[ORDER API] Request body keys:", Object.keys(body));
    
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      notes
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("[ORDER API] Validation failed: No items");
      return response(false, 400, "Order items are required", null);
    }

    if (!shippingAddress) {
      console.log("[ORDER API] Validation failed: No shipping address");
      return response(false, 400, "Shipping address is required", null);
    }

    console.log("[ORDER API] Items count:", items.length);

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const itemTotal = item.sellingPrice * item.quantity;
      subtotal += itemTotal;
      return {
        product: item.productId,
        variant: item.variantId || null,
        name: item.name,
        image: item.image || null,
        quantity: item.quantity,
        price: item.price,
        sellingPrice: item.sellingPrice,
        mrp: item.mrp || 0,
        discount: item.discount || 0,
        sku: item.sku || null,
        color: item.color || null,
        size: item.size || null
      };
    });

    // Calculate shipping (free above certain amount, else fixed)
    const shippingCost = subtotal > 500 ? 0 : 50;
    
    // Calculate tax (GST 18%)
    const taxAmount = Math.round(subtotal * 0.18);
    
    // Apply coupon discount if provided
    let discountAmount = 0;
    // TODO: Validate coupon code if provided
    
    const total = subtotal + shippingCost + taxAmount - discountAmount;
    
    console.log("[ORDER API] Order totals:", { subtotal, shippingCost, taxAmount, discountAmount, total });

    // Generate order ID
    const count = await OrderModel.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(6, '0')}`;
    console.log("[ORDER API] Generated orderId:", orderId);

    // Create order
    const order = new OrderModel({
      orderId,
      user: auth.user._id,
      firebaseUid: auth.user.uid,
      email: auth.user.email,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: paymentMethod || 'cod',
        status: 'pending',
        amount: total
      },
      status: 'pending',
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      couponCode: couponCode || null,
      total,
      notes: notes || null
    });

    await order.save();
    console.log("[ORDER API] Order saved, _id:", order._id);

    // Populate order before returning
    const populatedOrder = await OrderModel.findById(order._id)
      .populate('items.product', 'name slug')
      .populate('items.variant', 'color size sku')
      .lean();

    console.log("[ORDER API] Order created successfully, orderId:", populatedOrder.orderId);

    return response(true, 201, "Order created successfully", populatedOrder);
  } catch (error) {
    console.error("[ORDER API] POST /api/order error:", error);
    return catchError(error);
  }
}

