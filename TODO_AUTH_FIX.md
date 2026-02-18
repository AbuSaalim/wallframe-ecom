# Authentication Fix Plan

## Issue
After login with Firebase, users with admin role are not being redirected to dashboard properly.

## Root Causes Identified
1. Middleware checks for `authToken` or `__session` cookies that are never set after login
2. Login page doesn't dispatch user role to Redux after login
3. useFirebaseAuth hook always sets role to 'user' by default
4. No Firebase ID token cookie being set after login for middleware verification

## Fix Plan - COMPLETED

### Step 1: Create API route to set auth cookie ✅
- Created `/api/auth/set-cookie/route.js` - Sets auth token cookie after login

### Step 2: Update login page ✅
- Updated `app/(root)/auth/login/page.jsx`
- Added imports: getIdToken, useDispatch, login action
- Added `handleAuthSuccess` function to set cookie and dispatch to Redux
- Both Google Sign-In and Email/Password login now:
  - Get Firebase ID token
  - Call set-cookie API
  - Dispatch user data with correct role to Redux

### Step 3: Update useFirebaseAuth hook ✅
- Updated `hooks/useFirebaseAuth.js`
- Now fetches user role from API and stores correct role in Redux

### Step 4: Update logout API ✅
- Updated `app/api/auth/logout/route.js`
- Now properly clears both authToken and userRole cookies

## Files Edited
1. `app/api/auth/set-cookie/route.js` - NEW FILE
2. `app/(root)/auth/login/page.jsx` - UPDATED
3. `hooks/useFirebaseAuth.js` - UPDATED
4. `app/api/auth/logout/route.js` - UPDATED

## Build Status
✅ Build successful

