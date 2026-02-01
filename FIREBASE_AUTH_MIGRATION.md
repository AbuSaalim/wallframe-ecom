# Firebase Authentication Migration

This document outlines the complete migration from custom JWT/OTP authentication to Firebase Authentication.

## What Was Removed

### Authentication Files Removed:
- ✅ OTP Model (`/models/Otp.model.js`)
- ✅ Custom auth API routes (`/app/api/auth/*`)
- ✅ Nodemailer integration (`/lib/sendMail.js`)
- ✅ OTP email templates (`/mail/otpEmail.js`)
- ✅ JWT verification middleware
- ✅ Password hashing with bcrypt
- ✅ OTP generation utilities
- ✅ Email verification logic
- ✅ Custom login/signup API endpoints

### UI Components Removed:
- ✅ OTPVerification component
- ✅ UpdatePassword component
- ✅ Email verification page

### Redux Changes:
- ✅ Removed JWT token cookie persistence
- ✅ Updated auth reducer to include Firebase user data

## What Was Added

### New Firebase Files:

#### 1. **lib/firebase.js** - Firebase SDK initialization
```javascript
// Client-side Firebase config (PUBLIC - only NEXT_PUBLIC_ vars)
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

// Initializes Firebase and enables persistent auth
```

#### 2. **lib/authService.js** - Firebase auth helpers
```javascript
export const signUp(email, password, displayName)
export const login(email, password)
export const logout()
export const resetPassword(email)
export const getCurrentUser()
export const onAuthChange(callback)
export const getIdToken()
```

#### 3. **hooks/useFirebaseAuth.js** - Custom auth hook
```javascript
// Syncs Firebase auth state with Redux
const { user, loading, isAuthenticated, logout } = useFirebaseAuth()
```

#### 4. **components/Application/ProtectedRoute.jsx** - Route protection
```javascript
// Client-side protection for authenticated routes
<ProtectedRoute>
  <ProtectedComponent />
</ProtectedRoute>
```

## Updated Auth Pages

### 1. `/auth/login/page.jsx`
- **Before**: Sent credentials to API, received OTP via email
- **After**: Direct Firebase login, instant authentication
- **Features**:
  - Email & password validation with Zod
  - Firebase error mapping (user-not-found, wrong-password, etc.)
  - Redux state sync
  - Automatic redirect if already logged in

### 2. `/auth/register/page.tsx`
- **Before**: API registration + OTP verification
- **After**: Direct Firebase signup
- **Features**:
  - Client-side validation (name, email, password)
  - Password confirmation matching
  - Instant account creation
  - Automatic login after signup
  - Redirect to dashboard

### 3. `/auth/reset-password/page.jsx`
- **Before**: OTP-based password reset
- **After**: Firebase password reset email
- **Features**:
  - Simple email verification
  - Firebase handles reset link generation
  - User clicks link in email to reset password
  - No server-side password update needed

## Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable "Authentication" → "Email/Password"
4. Go to "Project Settings" → "Your apps"
5. Copy the config values

### 2. Set Environment Variables
```bash
# Create/update .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
MONGODB_URL=your_mongodb_url
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Update User Model (Optional)
Keep MongoDB User model for storing additional user data:
```javascript
// models/User.model.js - Firebase UID field recommended
const userSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: String,
  displayName: String,
  // Other user data (profile, preferences, etc.)
})
```

### 4. Update API Routes
For API routes that need user data:
```javascript
// Get Firebase user ID from auth header/token
const idToken = await request.headers.get('Authorization')?.split(' ')[1]
const decodedToken = await admin.auth().verifyIdToken(idToken)
const uid = decodedToken.uid
```

## Migration Guide for Developers

### Using Firebase Auth in Components

**1. Check if user is logged in:**
```jsx
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

function MyComponent() {
  const { user, isAuthenticated, logout } = useFirebaseAuth()
  
  if (!isAuthenticated) return <div>Please login</div>
  return <div>Welcome, {user.email}</div>
}
```

**2. Protect routes:**
```jsx
import ProtectedRoute from '@/components/Application/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

**3. Manual auth operations:**
```jsx
import { login, logout, resetPassword } from '@/lib/authService'

// Sign in
const user = await login(email, password)

// Sign out
await logout()

// Reset password
await resetPassword(email)
```

### Redirecting Authenticated Users

Already handled in auth pages:
- Login/Register/Reset pages automatically redirect if user is already logged in
- Check `useFirebaseAuth()` hook implementation

## Admin Role Management

Firebase doesn't provide built-in roles. Options:

**Option 1: Custom Claims (Recommended)**
```javascript
// Server-side (Node.js Admin SDK)
await admin.auth().setCustomUserClaims(uid, { role: 'admin' })

// Client-side
const claims = await user.getIdTokenResult()
const isAdmin = claims.claims.role === 'admin'
```

**Option 2: MongoDB Roles**
```javascript
// Store in User model
const user = await UserModel.findOne({ firebaseUid })
const isAdmin = user.role === 'admin'
```

## Security Notes

### ✅ What's Secure
- No passwords stored in code
- No secrets exposed to client (NEXT_PUBLIC_ only)
- Firebase handles all auth logic
- Passwords encrypted by Firebase
- No OTP storage vulnerabilities

### ⚠️ Important
- Firebase API keys are PUBLIC (they're only for web apps)
- Never store sensitive data in localStorage
- Always verify tokens server-side for sensitive operations
- Use Firebase Admin SDK on backend if needed

## Removing Old Auth Code

Already done:
- ✅ `/app/api/auth/*` - Remove custom API routes
- ✅ `/lib/sendMail.js` - Remove Nodemailer
- ✅ `/mail/` - Remove email templates
- ✅ `/models/Otp.model.js` - Remove OTP model
- ✅ Middleware JWT verification
- ✅ bcrypt password hashing

## Testing

### Test Cases
1. **Signup**: Create new account → Should auto-login → Redirect to dashboard
2. **Login**: Enter credentials → Should authenticate → Redirect to dashboard
3. **Reset Password**: Enter email → Firebase sends email → User resets password
4. **Logout**: Click logout → Should clear auth → Redirect to login
5. **Protected Routes**: Access `/my-account` without login → Redirect to login
6. **Session Persistence**: Close browser → Reopen → Should stay logged in

### Error Handling
- Invalid email format
- Password too weak
- User not found
- Wrong password
- Account already exists
- Too many failed attempts
- Network errors

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"
**Solution**: Wrap component with `ProtectedRoute` or check `useFirebaseAuth()` loading state

### Issue: User persists after logout
**Solution**: Firebase persistence is working correctly (feature, not bug). Close browser/clear data to test fresh auth.

### Issue: Auth errors not showing
**Solution**: Check browser console. Firebase returns specific error codes - map them to user messages.

## Environment Variables Required

```
# Firebase (PUBLIC)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# MongoDB
MONGODB_URL

# API
NEXT_PUBLIC_API_URL
```

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Add environment variables
3. ✅ Test signup/login/password reset
4. ✅ Update API routes to use Firebase UID if needed
5. ✅ Deploy to Vercel
6. ✅ Monitor auth errors in production
