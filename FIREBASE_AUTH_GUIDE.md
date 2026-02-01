# Firebase Authentication Middleware Setup Guide

## Overview

Your e-commerce app now uses Firebase authentication with MongoDB role-based access control. All admin APIs are protected with a reusable middleware that:

1. **Verifies Firebase ID tokens** from the `Authorization: Bearer <token>` header
2. **Fetches the user from MongoDB** using the Firebase UID/email
3. **Checks admin role** before allowing access
4. **Returns proper HTTP status codes**:
   - `200` / `201` - Success
   - `400` - Bad request (missing uid/email)
   - `401` - Invalid/missing token
   - `403` - Not admin (forbidden)
   - `404` - User not found in MongoDB
   - `500` - Server error

---

## Server-Side Setup (Already Done)

### 1. Firebase Admin SDK (`lib/firebaseAdmin.js`)
```javascript
import { adminAuth } from "@/lib/firebaseAdmin";

// Initializes Firebase Admin with service account
// Used for verifying tokens server-side
```

**IMPORTANT**: You need to add the Firebase service account as a base64-encoded environment variable:

```bash
# In Vercel environment variables:
FIREBASE_ADMIN_SDK=<base64-encoded serviceAccountKey.json>
```

To encode your service account key:
```bash
cat serviceAccountKey.json | base64
```

### 2. Auth Middleware (`lib/authMiddleware.js`)

**Usage in ANY admin API:**
```javascript
import { authMiddleware } from "@/lib/authMiddleware";
import { response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    // Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    // User is authenticated and admin
    console.log(auth.user); // { _id, uid, email, name, role }

    // ... rest of API logic
  } catch (error) {
    return catchError(error);
  }
}
```

**Middleware Options:**
```javascript
// Require admin role (default)
const auth = await authMiddleware(request, { requireAdmin: true });

// Only verify authentication (any role)
const auth = await authMiddleware(request, { requireAdmin: false });

// No auth required (optional)
const auth = await authMiddleware(request, { requireAuth: false });
```

---

## Client-Side Setup

### 1. Using API Client (`lib/apiClient.js`)

This automatically injects Firebase tokens into all requests:

```javascript
import apiClient from "@/lib/apiClient";

// Token automatically sent in Authorization header
const stats = await apiClient.get("/api/dashboard/stats");
const categories = await apiClient.get("/api/category");

// Supports all HTTP methods
await apiClient.post("/api/category/create", { name: "New Category" });
await apiClient.put("/api/user/role", { targetEmail: "user@email.com", role: "admin" });
await apiClient.delete("/api/category/delete/123");
```

### 2. Manual Token Injection (if not using apiClient)

If you're using axios directly, manually add the token:

```javascript
import { auth } from "@/lib/firebase";
import axios from "axios";

async function fetchData() {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await axios.get("/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = "/auth/login";
    }
    console.error("API Error:", error);
  }
}
```

---

## API Endpoint Examples

### Dashboard Stats (Already Updated)
```
GET /api/dashboard/stats
Authorization: Bearer <firebaseToken>

Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Stats fetched successfully",
  "data": {
    "totalCategories": 10,
    "totalProducts": 250,
    "totalCustomers": 1500,
    "totalOrders": 1250
  }
}
```

### Update User Role (Already Updated)
```
PUT /api/user/role
Authorization: Bearer <firebaseToken>
Content-Type: application/json

{
  "targetEmail": "user@gmail.com",
  "role": "admin"
}

Response:
{
  "success": true,
  "statusCode": 200,
  "message": "User role updated successfully",
  "data": {
    "id": "user_mongodb_id",
    "email": "user@gmail.com",
    "role": "admin"
  }
}
```

### Get All Users (Already Updated)
```
GET /api/user/role
Authorization: Bearer <firebaseToken>

Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "...",
      "name": "John",
      "email": "john@gmail.com",
      "role": "admin",
      "createdAt": "2025-02-01T..."
    },
    ...
  ]
}
```

---

## Updating Remaining APIs

If you have custom admin APIs that still use old authentication, follow this pattern:

### Before (Old JWT-based):
```javascript
import { isAuthenticated } from "@/lib/authentication";

export async function POST(request) {
  const auth = await isAuthenticated('admin');
  if (!auth.isAuth) {
    return response(false, 403, "Unauthorized");
  }
  // API logic
}
```

### After (Firebase-based):
```javascript
import { authMiddleware } from "@/lib/authMiddleware";

export async function POST(request) {
  const auth = await authMiddleware(request, { requireAdmin: true });
  if (auth.isError) return auth.response;
  
  // API logic - auth.user contains MongoDB user data
  console.log(auth.user.email); // Access user info
}
```

---

## Error Handling

### On Client Side:
```javascript
import apiClient from "@/lib/apiClient";

try {
  const data = await apiClient.get("/api/dashboard/stats");
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login - token expired
    window.location.href = "/auth/login";
  } else if (error.response?.status === 403) {
    // User is not admin
    showToast("error", "Admin access required");
  } else {
    showToast("error", error.response?.data?.message || "Server error");
  }
}
```

### On Server Side:
```javascript
import { authMiddleware } from "@/lib/authMiddleware";
import { response, catchError } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response; // Automatically handles 401/403/500

    // Your logic here
    return response(true, 200, "Success", data);
  } catch (error) {
    return catchError(error); // Handles MongoDB errors
  }
}
```

---

## Testing the Auth Flow

### 1. Test Admin User Login:
```bash
# Navigate to https://wallframe-ecom.vercel.app/auth/login
# Sign in with your test account
# Check browser console for network requests
```

### 2. Make API Call with Token:
```javascript
// In browser console:
const token = await firebase.auth().currentUser.getIdToken();
fetch('/api/dashboard/stats', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log(d));
```

### 3. Check Admin Role in MongoDB:
```javascript
// In MongoDB Atlas -> Browse Collections -> users
// Find your user and check:
{
  "email": "your@email.com",
  "role": "admin"  // Should be "admin" for admin users
}
```

---

## Troubleshooting

### Error: "Module not found: Can't resolve 'firebase-admin'"
**Fix**: Run `npm install firebase-admin`

### Error: 401 Unauthorized on API calls
**Causes**:
- Missing `Authorization` header
- Token expired (refresh by logging in again)
- Firebase credentials misconfigured in `.env.local`

**Fix**: 
- Use `apiClient` to auto-inject tokens
- Check `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` variables

### Error: 403 Forbidden on admin APIs
**Cause**: User exists in Firebase but role is not `"admin"` in MongoDB

**Fix**: 
- Update user role via `/api/user/role` endpoint
- Or manually update MongoDB: `db.users.updateOne({ email: "..." }, { $set: { role: "admin" } })`

### Error: 404 User not found
**Cause**: User authenticated in Firebase but doesn't exist in MongoDB

**Fix**:
- This shouldn't happen. Ensure `/api/user/create` is called on signup
- Check if user was created during registration

---

## Environment Variables Required

Add to `.env.local` and Vercel:

```
# Firebase Public Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (Private - Server-side only)
FIREBASE_ADMIN_SDK=<base64-encoded-service-account-key>

# MongoDB
MONGODB_URL=mongodb+srv://...
```

---
 
## Summary

| Component | Purpose | Location |
|-----------|---------|----------|
| `authMiddleware` | Verify tokens + check admin role | `lib/authMiddleware.js` |
| `apiClient` | Auto-inject tokens in requests | `lib/apiClient.js` |
| `firebaseAdmin` | Initialize Firebase Admin SDK | `lib/firebaseAdmin.js` |
| Protected APIs | `/api/dashboard/*`, `/api/category/*`, etc. | Updated with middleware |

All admin APIs now use **Firebase token verification** + **MongoDB role checks** for complete security! 🔐

