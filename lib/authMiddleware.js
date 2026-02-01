import { adminAuth } from "@/lib/firebaseAdmin";
import { connectDB } from "@/lib/detabaseConnection";
import UserModel from "@/models/User.model";
import { response } from "@/lib/helperFunction";

/**
 * Middleware to verify Firebase ID token and check admin role
 * 
 * Usage:
 * export async function GET(req) {
 *   const user = await authMiddleware(req, { requireAdmin: true });
 *   if (user.isError) return user.response;
 *   
 *   // User is authenticated and admin verified
 *   // Access user object: user._id, user.email, user.role, etc.
 * }
 */
export async function authMiddleware(
  req,
  options = { requireAdmin: true, requireAuth: true }
) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (options.requireAuth) {
        return {
          isError: true,
          response: response(false, 401, "Missing or invalid authorization token", null),
        };
      }
      return { isError: false, user: null };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Firebase token verification failed:", error.message);
      return {
        isError: true,
        response: response(false, 401, "Invalid or expired token", null),
      };
    }

    const firebaseUID = decodedToken.uid;
    const firebaseEmail = decodedToken.email;

    // Connect to database
    await connectDB();

    // Find user by Firebase UID
    let user = await UserModel.findOne({ uid: firebaseUID });

    if (!user) {
      // Try by email as fallback
      user = await UserModel.findOne({ email: firebaseEmail });
    }

    if (!user) {
      // User not found in MongoDB - this shouldn't happen if properly synced
      return {
        isError: true,
        response: response(false, 404, "User not found in database", null),
      };
    }

    // Check admin role if required
    if (options.requireAdmin && user.role !== "admin") {
      return {
        isError: true,
        response: response(
          false,
          403,
          "Admin access required",
          null
        ),
      };
    }

    // Return user object
    return {
      isError: false,
      user: {
        _id: user._id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      isError: true,
      response: response(false, 500, "Authentication server error", null),
    };
  }
}
