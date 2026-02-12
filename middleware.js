import { NextResponse } from "next/server"
import { WEBSITE_LOGIN } from "./routes/WebsiteRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        
        // Get auth token from cookies (assuming Firebase sets this)
        const authToken = request.cookies.get('authToken')?.value || 
                         request.cookies.get('__session')?.value

        const isAuthenticated = !!authToken

        // If user is authenticated and trying to access login page, redirect to home
        if (isAuthenticated && pathname.startsWith('/auth/login')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Allow auth routes without protection
        if (pathname.startsWith('/auth')) {
            return NextResponse.next()
        }

        // Protect admin routes - redirect to login if not authenticated
        if (pathname.startsWith('/admin')) {
            if (!isAuthenticated) {
                const loginUrl = new URL(WEBSITE_LOGIN(), request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
            return NextResponse.next()
        }

        // Protect user routes (cart, checkout, orders, my-account)
        const protectedRoutes = ['/cart', '/checkout', '/my-account', '/orders']
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
        
        if (isProtectedRoute && !isAuthenticated) {
            const loginUrl = new URL(WEBSITE_LOGIN(), request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        return NextResponse.next()

    } catch (error) {
        console.error('Middleware error:', error)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/my-account/:path*',
        '/auth/:path*',
        '/cart/:path*',
        '/checkout/:path*',
        '/orders/:path*'
    ]
}
