# Category Create API - Firebase Authentication Refactor

## Overview

The `/api/category/create` endpoint now uses Firebase authentication with MongoDB role verification. It validates request body fields with Zod and ensures only admin users can create categories.

---

## API Specification

### Endpoint
```
POST /api/category/create
```

### Authentication
**Required**: Firebase ID token in Authorization header

```
Authorization: Bearer <firebaseIdToken>
```

### Request Body
```json
{
  "name": "Electronics",
  "slug": "electronics"
}
```

#### Field Validation
| Field | Type | Requirements | Example |
|-------|------|--------------|---------|
| `name` | string | Required, 2-100 chars | "Electronics" |
| `slug` | string | Required, 2-100 chars, lowercase, alphanumeric + hyphens | "electronics" |

### Response Formats

#### ✅ Success (201 Created)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Electronics",
    "slug": "electronics",
    "createdAt": "2025-02-02T10:30:00.000Z",
    "updatedAt": "2025-02-02T10:30:00.000Z"
  }
}
```

#### ❌ No Authorization Token (401)
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

#### ❌ Not Admin User (403)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Admin access required"
}
```

#### ❌ Validation Error (400)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "name",
      "message": "Category name must be at least 2 characters"
    },
    {
      "field": "slug",
      "message": "Slug can only contain lowercase letters, numbers, and hyphens"
    }
  ]
}
```

#### ❌ Duplicate Slug (400)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Category with slug \"electronics\" already exists"
}
```

#### ❌ Invalid JSON (400)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid JSON in request body"
}
```

#### ❌ Server Error (500)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## How It Works - Step by Step

### Step 1: Firebase Token Verification
```javascript
const auth = await authMiddleware(request, { requireAdmin: true });
if (auth.isError) return auth.response;
```
- Extracts token from `Authorization: Bearer <token>` header
- Verifies token using Firebase Admin SDK
- Returns 401 if missing/invalid
- Returns 403 if user exists but is not admin
- Returns 404 if user not found in MongoDB

### Step 2: Database Connection
```javascript
await connectDB();
```
- Establishes MongoDB connection (pooled for performance)

### Step 3: Parse Request Body
```javascript
let payload = await request.json();
```
- Parses JSON payload
- Returns 400 if JSON is malformed

### Step 4: Validate Input
```javascript
const categoryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/)
});
const validate = categoryCreateSchema.safeParse(payload);
```
- Validates both fields using Zod
- Returns 400 with detailed error messages if validation fails

### Step 5: Check Uniqueness
```javascript
const existingCategory = await CategoryModel.findOne({ slug, deletedAt: null });
if (existingCategory) {
  return response(false, 400, `Category with slug "${slug}" already exists`);
}
```
- Ensures slug is unique (ignores soft-deleted categories)
- Returns 400 if slug already exists

### Step 6: Create & Save Category
```javascript
const newCategory = new CategoryModel({ name, slug });
await newCategory.save();
```
- Creates new MongoDB document
- Automatically sets `createdAt`, `updatedAt`, `deletedAt: null`

### Step 7: Return Success
```javascript
return response(true, 201, 'Category created successfully', {
  _id: newCategory._id,
  name: newCategory.name,
  slug: newCategory.slug,
  createdAt: newCategory.createdAt,
  updatedAt: newCategory.updatedAt,
});
```
- Returns 201 Created with category data
- Sensitive fields (like indices) are excluded

---

## Usage Examples

### JavaScript (Node.js / Browser)

#### Using apiClient (Recommended)
```javascript
import apiClient from "@/lib/apiClient";

try {
  const response = await apiClient.post("/api/category/create", {
    name: "Electronics",
    slug: "electronics"
  });
  
  console.log("Category created:", response.data.data);
} catch (error) {
  if (error.response?.status === 401) {
    console.error("Authentication failed - token expired or invalid");
  } else if (error.response?.status === 403) {
    console.error("Permission denied - admin role required");
  } else if (error.response?.status === 400) {
    console.error("Validation failed:", error.response.data.data);
  }
}
```

#### Manual Token Injection
```javascript
import axios from "axios";
import { auth } from "@/lib/firebase";

async function createCategory(name, slug) {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await axios.post(
      "/api/category/create",
      { name, slug },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Usage
const newCategory = await createCategory("Electronics", "electronics");
```

### Browser Console (Testing)
```javascript
// 1. Sign in to Firebase first at /auth/login
// 2. Run in console:

const token = await firebase.auth().currentUser.getIdToken();

fetch('/api/category/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Electronics',
    slug: 'electronics'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### cURL (Testing)
```bash
TOKEN="your-firebase-id-token"

curl -X POST http://localhost:3000/api/category/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "slug": "electronics"
  }'
```

---

## Error Scenarios

### Scenario 1: Missing Authorization Header
**Request:**
```
POST /api/category/create
Content-Type: application/json

{ "name": "Electronics", "slug": "electronics" }
```

**Response:** 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Missing or invalid authorization token"
}
```

### Scenario 2: Non-Admin User Attempts to Create Category
**User role in MongoDB:** `"user"` (not admin)

**Response:** 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Admin access required"
}
```

### Scenario 3: Validation Errors
**Request:**
```json
{
  "name": "E",
  "slug": "ELECTRONICS"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "name",
      "message": "Category name must be at least 2 characters"
    },
    {
      "field": "slug",
      "message": "Slug can only contain lowercase letters, numbers, and hyphens"
    }
  ]
}
```

### Scenario 4: Duplicate Slug
**Request:**
```json
{
  "name": "Electronics New",
  "slug": "electronics"
}
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Category with slug \"electronics\" already exists"
}
```

---

## Validation Rules

### Name Field
- ✅ Required
- ✅ Minimum 2 characters
- ✅ Maximum 100 characters
- ✅ Can contain any characters
- ❌ Cannot be empty after trim

**Valid Examples:**
- "Electronics"
- "Home & Garden"
- "Men's Clothing"
- "20% Off Sale"

### Slug Field
- ✅ Required
- ✅ Minimum 2 characters
- ✅ Maximum 100 characters
- ✅ Must be lowercase
- ✅ Can only contain: `a-z`, `0-9`, `-`
- ❌ No spaces, uppercase, or special characters (except hyphen)
- ❌ Must be unique in database

**Valid Examples:**
- "electronics"
- "mens-clothing"
- "home-garden"
- "sale-20-percent-off"

**Invalid Examples:**
- "Electronics" ❌ (uppercase)
- "home & garden" ❌ (special character)
- "home garden" ❌ (space)
- "home_garden" ❌ (underscore)

---

## Reusable Pattern for Other POST/PUT/DELETE APIs

This authentication pattern applies to **all admin-only endpoints**:

### Template
```javascript
import { authMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";

export async function POST(request) {
  try {
    // Step 1: Verify Firebase token and admin role
    const auth = await authMiddleware(request, { requireAdmin: true });
    if (auth.isError) return auth.response;

    // Step 2: Connect DB
    await connectDB();

    // Step 3: Parse and validate
    const payload = await request.json();
    const validate = yourSchema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, 'Validation failed', 
        validate.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      );
    }

    // Step 4: Business logic
    // ... your API logic here ...

    // Step 5: Return success
    return response(true, 201, 'Resource created', data);
  } catch (error) {
    return catchError(error);
  }
}
```

### Key Points
1. Always call `authMiddleware` first
2. Check `auth.isError` before proceeding
3. Return `auth.response` if error
4. Access user data via `auth.user` (contains email, _id, role)
5. Use Zod for validation
6. Return proper HTTP status codes

---

## Security Considerations

✅ **Security Features Implemented:**
1. Firebase token verified **server-side** (never trust client)
2. Role checked in MongoDB (single source of truth)
3. Slug uniqueness prevents duplicate categories
4. Proper HTTP status codes (401, 403, 400, 500)
5. Error messages don't leak internal details
6. JSON parsing wrapped in try/catch
7. All database operations await promises

⚠️ **Best Practices:**
- Always use authMiddleware for admin APIs
- Never hardcode user roles on client
- Token expiry handled automatically by Firebase SDK
- Validate all input from request body
- Use Zod for runtime validation
- Handle async/await errors with try/catch

---

## Testing Checklist

- [ ] Sign in as admin user via `/auth/login`
- [ ] Create category with valid name and slug → Should return 201
- [ ] Try creating duplicate slug → Should return 400
- [ ] Try with invalid name (too short) → Should return 400
- [ ] Try with invalid slug (uppercase) → Should return 400
- [ ] Try without Authorization header → Should return 401
- [ ] Try with expired token → Should return 401
- [ ] Sign in as non-admin user → Should return 403
- [ ] Verify category in MongoDB has correct fields
- [ ] Check that `deletedAt` is `null` for new categories

---

## Summary

**What Changed:**
- ✅ Removed old `LoginSchema` reference (incorrect)
- ✅ Added dedicated `categoryCreateSchema` with proper validation
- ✅ Added comprehensive JSDoc comments
- ✅ Added step-by-step comments for clarity
- ✅ Better error messages (shows which slug already exists)
- ✅ Proper Zod validation with formatted error responses
- ✅ JSON parsing error handling

**Pattern Features:**
- ✅ Firebase token verification
- ✅ Admin role check
- ✅ Input validation with Zod
- ✅ Uniqueness check
- ✅ Proper error handling (401, 403, 400, 500)
- ✅ Reusable for other admin APIs

This pattern is now ready to apply to all POST/PUT/DELETE endpoints! 🚀
