import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response, catchError } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;

    // Validate Firebase user data
    if (!uid || !email) {
      return response(false, 400, "uid and email are required", null);
    }

    // Check if user already exists
    let existingUser = await UserModel.findOne({ uid });
    
    if (existingUser) {
      // User exists - return success (idempotent)
      return response(true, 200, "User already exists", {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      });
    }

    // Also check by email in case Firebase user data changed
    existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      // Update uid if it's different
      if (existingUser.uid !== uid) {
        existingUser.uid = uid;
        await existingUser.save();
      }
      return response(true, 200, "User already exists", {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      });
    }

    // Create new user from Firebase data
    const user = new UserModel({
      uid,
      email,
      name: displayName || email.split("@")[0], // Use email prefix as fallback
      role: "user", // Default role
      isEmailVerified: true, // Firebase users are pre-verified
      avatar: {
        url: photoURL || "",
        public_id: "",
      },
      password: "", // Not used with Firebase
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
