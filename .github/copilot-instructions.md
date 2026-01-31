# Copilot Instructions for E-Commerce Project

## Architecture Overview

This is a **Next.js 15 (App Router) full-stack e-commerce application** with role-based access control (admin/user), MongoDB backend, and Radix UI + Material-UI components.

### Core Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS
- **State Management**: Redux Toolkit + Redux Persist (client-side), React Query (server queries)
- **Backend**: Next.js API routes, Mongoose (MongoDB)
- **UI Components**: Radix UI (primitives), Material-UI (admin tables), shadcn/ui patterns
- **Authentication**: JWT tokens (stored in HttpOnly cookies), Middleware-based route protection
- **Media**: Cloudinary integration via next-cloudinary

### Project Structure Conventions
- `app/(root)/` - Main app with nested route groups for admin/website/auth
- `app/api/` - API routes organized by resource (category, product, coupon, etc.)
- `components/Application/` - Feature-specific components (Admin/, Website/)
- `lib/` - Utilities: database connection, authentication, helpers, schemas
- `models/` - Mongoose schemas
- `routes/` - Route constant definitions (never hardcode paths; use these exports)
- `store/` - Redux store with persisted auth state

## Critical Patterns & Workflows

### 1. API Route Pattern (Unified CRUD)
All API routes follow a consistent structure in `app/api/[resource]/route.js`:
```javascript
// Mandatory pattern:
export async function GET(request) {
  const auth = await isAuthenticated('admin'); // Role check
  if (!auth.isAuth) return response(false, 403, 'Unauthorized');
  
  await connectDB();
  // Query logic with MongoDB aggregation pipeline
  // Support: pagination (start/size), filtering, sorting, soft delete
  return response(true, 200, 'Success', data);
}
```
- **Response format**: `{ success, statusCode, message, data }`
- **Error handling**: Use `catchError()` helper for MongoDB errors (handles duplicates)
- **Soft deletes**: Filter by `deletedAt: null` in queries, not hard deletes

### 2. Route Protection & Authentication
- **Middleware** (`middleware.js`) checks JWT in cookies before any request
- Routes auto-redirect: non-logged users → login, logged users → dashboard based on role
- Admin routes check `role === 'admin'` in middleware; user routes check `role !== 'admin'`
- **Route constants** prevent hardcoding: Use [AdminPanelRoute.js](AdminPanelRoute.js) / [WebsiteRoute.js](WebsiteRoute.js)
- Example: `ADMIN_PRODUCT_EDIT(id)` returns `/admin/product/edit/${id}` dynamically

### 3. Form Validation & Zod Schemas
All forms use **Zod** ([lib/zodSchema.js](lib/zodSchema.js)) for client & server validation:
```javascript
// Centralized schema object (one per form type)
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[a-zA-Z0-9]/)
  // ...
});
```
- Use with `react-hook-form` + `@hookform/resolvers`
- Reuse same schema for both client validation & API input checks

### 4. State Management Dual Pattern
- **Redux** (via [store/store.js](store/store.js)): Persisted auth state (`authReducer`)
- **React Query**: Server-state queries from API routes (initialized in [GlobalProvider.jsx](components/Application/GlobalProvider.jsx))
- **Client Provider Hierarchy**: QueryClientProvider → Redux Provider → PersistGate → children

### 5. Data Fetching Hooks
- **`useFetch(url, method, options)`** ([hooks/useFetch.js](hooks/useFetch.js)): Generic axios wrapper with refresh capability
- **`useDeleteMutation()`**: Specialized hook for delete operations with confirmation
- Always check `response.success` before using `response.data`
- Example error handling: `error?.message` from axios response

### 6. Component Structure
- **UI Components** (`components/ui/`): Radix-based headless components (card, button, input, etc.)
- **Feature Components** (`components/Application/`): Page-level (Header, Footer, tables, forms)
- Admin pages use **Material React Table** with custom column configs ([lib/column.js](lib/column.js))
- All tables support: pagination, filtering, global search, sorting, soft-delete toggle (deleteType=SD|PD)

### 7. MongoDB & Soft Deletes
- All models have `deletedAt: Date | null` field with TTL index
- API queries filter: `deletedAt: null` by default
- Admin UI includes trash/restore via `deleteType` query param
- Helper `columnConfig(columns, isCreatedAt, isUpdatedAt, isDeletedAt)` adds timestamp columns

### 8. Email & OTP System
- Email templates in [mail/](mail/) (emailLinkVerification, otpEmail, orderNotification)
- OTP generation: `generateOTP()` in [lib/helperFunction.js](lib/helperFunction.js) → 6-digit code
- Stored in `Otp.model.js` with expiry; verified via `/api/auth/verify-otp`

### 9. Image/Media Handling
- Cloudinary integration via `next-cloudinary`
- All product images reference Media model (ObjectId references)
- Cloudinary URL patterns: `https://*.cloudinary.com/**` (allowed in next.config.mjs)
- Upload via `/api/media` endpoints with auth required

## Development Workflow

### Build & Run Commands
```bash
npm run dev        # Start dev server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run start      # Production server
npm run lint       # Run ESLint
```

### Environment Variables Required
```
MONGODB_URL=mongodb+srv://...
SECRET_KEY=<your-jwt-secret>
CLOUDINARY_CLOUD_NAME=<account>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
SMTP_HOST=...      # For Nodemailer
SMTP_USER=...
SMTP_PASSWORD=...
NEXT_PUBLIC_API_URL=http://localhost:3000  # Frontend API base
```

### Database Setup
- Models auto-create indexes on first connect
- Soft-delete cleanup via MongoDB TTL index (deletedAt field)
- Connection pooling: Cached in `global.mongoose` to prevent reconnects

## Key Files to Know

| File | Purpose |
|------|---------|
| [middleware.js](middleware.js) | Request auth, role-based route protection |
| [lib/authentication.js](lib/authentication.js) | JWT verification, role checking |
| [lib/helperFunction.js](lib/helperFunction.js) | Response formatting, error catching, OTP gen |
| [lib/detabaseConnection.js](lib/detabaseConnection.js) | Mongoose connection pooling |
| [lib/zodSchema.js](lib/zodSchema.js) | Centralized form validation schemas |
| [store/store.js](store/store.js) | Redux + Redux Persist config |
| [routes/*.js](routes/) | Route constants (import, never hardcode) |
| [components/Application/GlobalProvider.jsx](components/Application/GlobalProvider.jsx) | Query + Redux provider tree |

## Common Gotchas

1. **Always use route constants**: `ADMIN_PRODUCT_EDIT(id)` not `/admin/product/edit/${id}`
2. **Check `response.success`**: API responses are structured; don't assume `data` exists without checking
3. **Middleware token check**: Cookies must be HttpOnly; middleware verifies JWT server-side
4. **Soft deletes in queries**: Default filter is `deletedAt: null`; test with `deleteType` param for trash
5. **Redux serialization**: Middleware ignores persist actions for Redux compatibility
6. **Global filter in tables**: MongoDB uses `$or` with `$regex` for text search across multiple fields

## Adding New Resources

When adding a new CRUD resource:
1. Create Mongoose model in `models/[Resource].model.js` with `deletedAt` field
2. Create API route at `app/api/[resource]/route.js` following the unified pattern
3. Add route constants to [routes/AdminPanelRoute.js](routes/AdminPanelRoute.js) or [routes/WebsiteRoute.js](routes/WebsiteRoute.js)
4. Create Zod schema in [lib/zodSchema.js](lib/zodSchema.js)
5. Build UI components in `components/Application/Admin/[Resource]` or `components/Application/Website/[Resource]`
6. Use `useFetch` hook or React Query for data fetching
