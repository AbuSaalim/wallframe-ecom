import { NextResponse } from "next/server"
import { WEBSITE_LOGIN } from "./routes/WebsiteRoute"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname

        // Allow auth routes without protection (Firebase handles auth client-side)
        if (pathname.startsWith('/auth')) {
            return NextResponse.next()
        }

        // Protect admin routes
        if (pathname.startsWith('/admin')) {
            return NextResponse.next() // Client-side will check Firebase auth
        }

        // Protect user routes (cart, checkout, orders, my-account)
        if (pathname.startsWith('/cart') || 
            pathname.startsWith('/checkout') || 
            pathname.startsWith('/my-account') ||
            pathname.startsWith('/orders')) {
            return NextResponse.next() // Client-side will check Firebase auth
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
