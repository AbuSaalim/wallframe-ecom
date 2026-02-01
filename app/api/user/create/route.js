import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response, catchError } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { uid, name, email, role = "user" } = body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return response(false, 400, "User already exists", null);
    }

    // Create new user with role
    const user = new UserModel({
      uid,
      name,
      email,
      role,
      password: "", // Firebase handles password
    });

    await user.save();

    return response(true, 201, "User created successfully", {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    return catchError(error);
  }
}
