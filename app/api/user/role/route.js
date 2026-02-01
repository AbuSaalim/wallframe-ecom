import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response, catchError } from "@/lib/helperFunction";
import { authMiddleware } from "@/lib/authMiddleware";

export async function PUT(request) {
  try {
    // Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();

    // Get target user email and role from request body
    const { targetEmail, role } = await request.json();

    if (!targetEmail || !role) {
      return response(false, 400, "targetEmail and role are required", null);
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
    // Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();

    // Get all users
    const users = await UserModel.find({ deletedAt: null }).select(
      "name email role createdAt"
    );

    return response(true, 200, "Users fetched successfully", users);
  } catch (error) {
    return catchError(error);
  }
}
