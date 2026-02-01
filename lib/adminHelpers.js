// SERVER-SIDE ONLY - Do NOT import in client components
// These functions use UserModel directly and must only run on the server

import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response } from "@/lib/helperFunction";

export async function checkAdminRole(email) {
  try {
    await connectDB();
    const user = await UserModel.findOne({ email });
    return user?.role === "admin";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

export async function checkAdminRoleByUid(uid) {
  try {
    await connectDB();
    const user = await UserModel.findOne({ uid });
    return user?.role === "admin";
  } catch (error) {
    console.error("Error checking admin role by uid:", error);
    return false;
  }
}

export async function requireAdminRole(email) {
  const isAdmin = await checkAdminRole(email);
  if (!isAdmin) {
    return response(false, 403, "Admin access required", null);
  }
  return null;
}

export async function requireAdminRoleByUid(uid) {
  const isAdmin = await checkAdminRoleByUid(uid);
  if (!isAdmin) {
    return response(false, 403, "Admin access required", null);
  }
  return null;
}
