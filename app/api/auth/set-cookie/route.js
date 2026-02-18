import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Set authentication cookie after Firebase login
 * This allows the middleware to verify user authentication
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { idToken, email, role } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'ID token is required' },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Cookie set successfully', role },
      { status: 200 }
    );

    // Set the auth cookie (valid for 7 days)
    // This cookie is used by middleware to verify authentication
    response.cookies.set('authToken', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set a separate cookie for role (for client-side access)
    response.cookies.set('userRole', role || 'user', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Set cookie error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set cookie' },
      { status: 500 }
    );
  }
}

