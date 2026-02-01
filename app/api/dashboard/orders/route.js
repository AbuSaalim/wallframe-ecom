import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/detabaseConnection";
import { response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

// Mock data for orders until Order model is created
const mockOrders = [
  {
    _id: "6708d4e5c1b2a3f4e5f6g7h8",
    orderId: "#ORD-001",
    paymentId: "PAY-2025-001",
    items: 3,
    status: "completed",
    amount: 2500,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "6708d4e5c1b2a3f4e5f6g7h9",
    orderId: "#ORD-002",
    paymentId: "PAY-2025-002",
    items: 2,
    status: "pending",
    amount: 1800,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "6708d4e5c1b2a3f4e5f6g7i0",
    orderId: "#ORD-003",
    paymentId: "PAY-2025-003",
    items: 5,
    status: "completed",
    amount: 4200,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "6708d4e5c1b2a3f4e5f6g7i1",
    orderId: "#ORD-004",
    paymentId: "PAY-2025-004",
    items: 1,
    status: "cancelled",
    amount: 1200,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "6708d4e5c1b2a3f4e5f6g7i2",
    orderId: "#ORD-005",
    paymentId: "PAY-2025-005",
    items: 4,
    status: "completed",
    amount: 3500,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    // TODO: Replace with actual Order model query when available
    const latestOrders = mockOrders.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: latestOrders,
      message: "Latest orders fetched successfully",
    });
  } catch (error) {
    console.error("GET /api/dashboard/orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message, statusCode: 500 },
      { status: 500 }
    );
  }
}
