import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response, catchError } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return response(false, 400, "Email parameter required", null);
    }

    await connectDB();
    const user = await UserModel.findOne({ email }).select("role email");

    if (!user) {
      return response(false, 404, "User not found", null);
    }

    return response(true, 200, "Role fetched successfully", {
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return catchError(error);
  }
}
