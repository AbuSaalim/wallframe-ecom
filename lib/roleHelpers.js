// SERVER-SIDE ONLY - Do NOT import in client components
// Use @/lib/clientRoleHelpers for client-side role checks instead

import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";

export async function getUserRole(email) {
  try {
    await connectDB();
    const user = await UserModel.findOne({ email });
    return user?.role || "user";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user";
  }
}

export async function getRoleFromFirebaseUid(uid) {
  try {
    await connectDB();
    const user = await UserModel.findOne({ uid });
    return user?.role || "user";
  } catch (error) {
    console.error("Error fetching user by uid:", error);
    return "user";
  }
}

export async function updateUserRole(email, role) {
  try {
    await connectDB();
    const user = await UserModel.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}
