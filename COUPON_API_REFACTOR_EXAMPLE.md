# Coupon API Firebase Authentication Refactor

## What Changed

The `/api/coupon` endpoint now uses Firebase authentication with MongoDB role verification instead of the legacy JWT-based `isAuthenticated()` function.

### Before (Old Authentication)
```javascript
import { isAuthenticated } from "@/lib/authentication";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.');
    }
    // ... rest of API logic
  }
}
```

### After (Firebase Authentication) ✅
```javascript
import { authMiddleware } from "@/lib/authMiddleware";

export async function GET(request) {
  try {
    // Verify Firebase token and check admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;
    
    // ... rest of API logic unchanged
  }
}
```

---

## How It Works

### 1. **Client Sends Firebase Token**

The client extracts the Firebase ID token and sends it in the `Authorization` header:

```javascript
import apiClient from "@/lib/apiClient"; // Auto-injects token

// Option 1: Using apiClient (recommended)
const response = await apiClient.get("/api/coupon?start=0&size=10");

// Option 2: Manual token injection
const token = await firebaseAuth.currentUser.getIdToken();
const response = await axios.get("/api/coupon?start=0&size=10", {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. **Server Verifies Token & User Role**

The `authMiddleware` function handles the verification:

```javascript
// Step 1: Extract token from Authorization header
const authHeader = req.headers.get("authorization");
const token = authHeader.substring(7); // Remove "Bearer " prefix

// Step 2: Verify Firebase ID token
const decodedToken = await adminAuth.verifyIdToken(token);
// If invalid/expired → return 401 Unauthorized

// Step 3: Fetch user from MongoDB
const user = await UserModel.findOne({ 
  uid: decodedToken.uid 
});
// If not found → return 404 Not Found

// Step 4: Check admin role
if (user.role !== 'admin') {
  return response(false, 403, "Admin access required");
  // If not admin → return 403 Forbidden
}

// Step 5: User is verified ✅
return { isError: false, user };
```

### 3. **Response Format**

#### ✅ Success (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "code": "SUMMER20",
      "discountPercentage": 20,
      "minimumShoppingAmount": 100,
      "validity": "2025-08-31T00:00:00.000Z",
      "createdAt": "2025-02-01T10:30:00.000Z",
      "updatedAt": "2025-02-01T10:30:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "totalRowCount": 45
  }
}
```

#### ❌ No Token (401)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Missing or invalid authorization token"
}
```

#### ❌ Invalid Token (401)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

#### ❌ Not Admin (403)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Admin access required"
}
```

#### ❌ User Not in Database (404)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found in database"
}
```

#### ❌ Server Error (500)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Authentication server error"
}
```

---

## Using This Pattern for Other Admin APIs

This is the **reusable pattern** for any admin-only API:

### Step 1: Import the middleware
```javascript
import { authMiddleware } from "@/lib/authMiddleware";
```

### Step 2: Verify auth at the start of your API
```javascript
export async function GET(request) {
  try {
    // Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    // At this point, user is authenticated and admin verified
    // Access user data: auth.user.email, auth.user._id, auth.user.role
    
    // ... your API logic
  } catch (error) {
    return catchError(error);
  }
}
```

### Step 3: (Optional) Use auth.user for logging or access control
```javascript
export async function POST(request) {
  try {
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    await connectDB();
    const body = await request.json();

    // Example: Log who created this resource
    console.log(`Admin ${auth.user.email} created new coupon`);

    // Create the resource
    const coupon = new CouponModel({ ...body, createdBy: auth.user._id });
    await coupon.save();

    return response(true, 201, "Coupon created", coupon);
  } catch (error) {
    return catchError(error);
  }
}
```

---

## Middleware Options

The `authMiddleware` function accepts options to customize behavior:

### Require Admin (Default)
```javascript
const auth = await authMiddleware(request, { requireAdmin: true });
// Returns 403 if user is not admin
```

### Only Require Authentication (Any Role)
```javascript
const auth = await authMiddleware(request, { requireAdmin: false });
// Returns 401 if no token, but accepts any role
```

### Optional Authentication
```javascript
const auth = await authMiddleware(request, { requireAuth: false });
// Does not require token, user will be null if not authenticated
```

---

## Testing the Coupon API

### Using Browser Console

```javascript
// 1. Sign in at https://wallframe-ecom.vercel.app/auth/login

// 2. Get the Firebase token
const token = await firebase.auth().currentUser.getIdToken();

// 3. Call the API with token
fetch('/api/coupon?start=0&size=10', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data));
```

### Using cURL

```bash
# Get token (manual copy from Firebase console or browser console)
TOKEN="your-firebase-id-token"

curl -X GET "http://localhost:3000/api/coupon?start=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Results

| Scenario | Status | Reason |
|----------|--------|--------|
| Valid admin token | 200 | User authenticated and has admin role ✅ |
| Valid user token | 403 | User authenticated but not admin |
| Invalid/expired token | 401 | Token verification failed |
| No token sent | 401 | Missing Authorization header |
| Token not in DB | 404 | User exists in Firebase but not MongoDB |
| Malformed header | 401 | Authorization header doesn't start with "Bearer " |

---

## Common Issues & Fixes

### Issue: 500 Server Error
**Cause**: Usually `isAuthenticated` function not found (old auth import)

**Fix**: 
- ✅ Replace with `authMiddleware` import from `@/lib/authMiddleware`
- ✅ Change logic: `if (auth.isError) return auth.response;`

### Issue: 401 Unauthorized
**Cause**: Token not sent or invalid

**Check**:
```javascript
// In browser console:
await firebase.auth().currentUser.getIdToken()
// Should return a valid JWT token string

// Check if Authorization header is being sent:
// Open DevTools → Network → Click API call → Headers
// Should see: Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### Issue: 403 Forbidden
**Cause**: User is not admin in MongoDB

**Fix**: Update user role in MongoDB
```bash
# MongoDB Atlas console or local mongo:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Issue: 404 User Not Found
**Cause**: User exists in Firebase but not in MongoDB

**Fix**: 
- Ensure user was created in MongoDB during signup
- Check that `uid` field matches Firebase UID

---

## Security Notes

✅ **Best Practices Implemented**:
1. Token verified **server-side** using Firebase Admin SDK (never trust client)
2. Role checked in MongoDB (single source of truth)
3. Proper HTTP status codes (401, 403, 404, 500)
4. Token extraction validates "Bearer " prefix
5. Database connection pooled for performance
6. Error messages safe (no internal details leaked)

⚠️ **Important**:
- Always use `authMiddleware` for admin APIs
- Never hardcode user roles on client
- Token expiry handled by Firebase SDK (auto-refresh on client)
- Always check `auth.isError` before proceeding

---

## Summary

**Old Pattern (Removed)**:
- ❌ Used custom JWT tokens
- ❌ No Firebase integration
- ❌ Less secure role checking

**New Pattern (Active)**:
- ✅ Firebase ID token verification
- ✅ MongoDB user lookup & role checking
- ✅ Proper error handling (401/403/404/500)
- ✅ Reusable middleware for all admin APIs
- ✅ Client auto-injects tokens via apiClient

The coupon API now follows this secure, scalable pattern that can be applied to all 40+ admin APIs! 🔐
