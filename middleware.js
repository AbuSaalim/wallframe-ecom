import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const hasToken = request.cookies.has('access_token')  // ✅ Fixed: hashtoken → hasToken

        if (!hasToken) {
            // If the user is not logged in and trying to access a protected route, redirect to login page
            if (!pathname.startsWith('/auth')) {
                return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            }
            return NextResponse.next() // Allow access to auth routes if not logged in
        }

        // Verify token
        const access_token = request.cookies.get('access_token').value
        const { payload } = await jwtVerify(
            access_token, 
            new TextEncoder().encode(process.env.SECRET_KEY)
        )

        const role = payload.role

        // Prevent logged-in users from accessing auth routes
        if (pathname.startsWith('/auth')) {
            return NextResponse.redirect(
                new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl)
            )
        }

        // Protect admin routes
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        // Protect user routes
        if (pathname.startsWith('/my-account') && role !== 'user') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        return NextResponse.next()

    } catch (error) {
        console.error('Middleware error:', error);  // ✅ Added error logging
        
        // Clear invalid token and redirect to login
        const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        response.cookies.delete('access_token')  // ✅ Clear invalid token
        return response
    }
}

export const config = {
    matcher: [
        '/admin/:path*',      // ✅ Fixed: Added * to match nested routes
        '/my-account/:path*', // ✅ Fixed: Added * to match nested routes
        '/auth/:path*'        // ✅ Fixed: Added missing / and * 
    ]
}
