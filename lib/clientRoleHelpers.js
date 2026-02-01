// CLIENT-SIDE ONLY helper - uses API calls instead of direct DB access
// Never import UserModel or connectDB here

import axios from "axios";

export async function getUserRoleFromAPI(email) {
  try {
    const response = await axios.get(`/api/user/get-role?email=${email}`);
    return response.data?.data?.role || "user";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user";
  }
}

export async function checkIfAdmin(email) {
  const role = await getUserRoleFromAPI(email);
  return role === "admin";
}
