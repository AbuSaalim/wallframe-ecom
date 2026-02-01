import { response } from '@/lib/helperFunction';

export async function POST(request) {
  try {
    // Clear authentication by removing the token cookie
    const res = response(true, 200, 'Logged out successfully', null);
    
    // Clear the Firebase token cookie (if using cookies)
    res.cookies.delete('firebase-token');
    
    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return response(false, 500, 'Logout failed', null);
  }
}
