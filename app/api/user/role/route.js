import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response, catchError } from "@/lib/helperFunction";
import { requireAdminRole } from "@/lib/adminHelpers";

export async function PUT(request) {
  try {
    await connectDB();

    // Get requester's email from header or body
    const { email: requesterEmail, targetEmail, role } = await request.json();

    // Check if requester is admin
    const adminCheck = await requireAdminRole(requesterEmail);
    if (adminCheck) {
      return adminCheck;
    }

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return response(false, 400, "Invalid role", null);
    }

    // Update target user's role
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: targetEmail },
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return response(false, 404, "User not found", null);
    }

    return response(true, 200, "User role updated successfully", {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // Get requester's email from query
    const { searchParams } = new URL(request.url);
    const requesterEmail = searchParams.get("requesterEmail");

    // Check if requester is admin
    const adminCheck = await requireAdminRole(requesterEmail);
    if (adminCheck) {
      return adminCheck;
    }

    // Get all users
    const users = await UserModel.find({ deletedAt: null }).select(
      "name email role createdAt"
    );

    return response(true, 200, "Users fetched successfully", users);
  } catch (error) {
    return catchError(error);
  }
}
