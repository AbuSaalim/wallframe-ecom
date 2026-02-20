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
    console.log("[AUTH MIDDLEWARE] Starting authentication check");
    console.log("[AUTH MIDDLEWARE] Options:", options);
    
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    console.log("[AUTH MIDDLEWARE] Authorization header present:", !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH MIDDLEWARE] No valid Bearer token found");
      if (options.requireAuth) {
        return {
          isError: true,
          response: response(false, 401, "Missing or invalid authorization token", null),
        };
      }
      return { isError: false, user: null };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("[AUTH MIDDLEWARE] Token present, length:", token.length);

    // Verify Firebase ID token
    let decodedToken;
    try {
      console.log("[AUTH MIDDLEWARE] Verifying Firebase token...");
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log("[AUTH MIDDLEWARE] Token verified, uid:", decodedToken.uid, "email:", decodedToken.email);
    } catch (error) {
      console.error("[AUTH MIDDLEWARE] Firebase token verification failed:", error.message);
      return {
        isError: true,
        response: response(false, 401, "Invalid or expired token", null),
      };
    }

    const firebaseUID = decodedToken.uid;
    const firebaseEmail = decodedToken.email;

    // Connect to database
    console.log("[AUTH MIDDLEWARE] Connecting to database...");
    await connectDB();
    console.log("[AUTH MIDDLEWARE] Database connected");

    // Find user by Firebase UID
    console.log("[AUTH MIDDLEWARE] Looking up user by uid:", firebaseUID);
    let user = await UserModel.findOne({ uid: firebaseUID });
    
    console.log("[AUTH MIDDLEWARE] User found by uid:", !!user);

    if (!user) {
      // Try by email as fallback
      console.log("[AUTH MIDDLEWARE] User not found by uid, trying email:", firebaseEmail);
      user = await UserModel.findOne({ email: firebaseEmail });
      console.log("[AUTH MIDDLEWARE] User found by email:", !!user);
    }

    if (!user) {
      // User not found in MongoDB - this shouldn't happen if properly synced
      console.log("[AUTH MIDDLEWARE] User not found in MongoDB at all!");
      return {
        isError: true,
        response: response(false, 404, "User not found in database", null),
      };
    }

    console.log("[AUTH MIDDLEWARE] User found in DB, role:", user.role);

    // Check admin role if required
    if (options.requireAdmin && user.role !== "admin") {
      console.log("[AUTH MIDDLEWARE] Admin access required but user is not admin");
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
    console.log("[AUTH MIDDLEWARE] Authentication successful, returning user");
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
    console.error("[AUTH MIDDLEWARE] Auth middleware error:", error);
    return {
      isError: true,
      response: response(false, 500, "Authentication server error", null),
    };
  }
}
