import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";
import { jwtVerify } from "jose";

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        console.log('Received body:', body);
        
        const { token } = body;

        if (!token) {
            console.log('No token provided');
            return response(false, 400, 'Missing token');
        }

        console.log('Token received, length:', token.length);

        // Verify JWT token
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        
        let decoded;
        try {
            decoded = await jwtVerify(token, secret);
            console.log('Token decoded successfully');
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return response(false, 401, `Invalid or expired token: ${jwtError.message}`);
        }

        let userId = decoded.payload.userId;

        if (!userId) {
            console.log('No userId in token payload');
            return response(false, 400, 'Invalid token payload - no userId');
        }

        // ✅ Handle both old (Buffer) and new (string) format
        if (typeof userId === 'object' && userId.buffer) {
            // Old format: Convert Buffer to string
            const bufferArray = Object.values(userId.buffer);
            const buffer = Buffer.from(bufferArray);
            userId = buffer.toString('hex');
            console.log('Converted Buffer userId to string:', userId);
        } else {
            console.log('Using string userId:', userId);
        }

        console.log('Looking for user with ID:', userId);

        // Find user
        const user = await UserModel.findById(userId);

        if (!user) {
            console.log('User not found for ID:', userId);
            return response(false, 404, "User not found.");
        }

        // Check if already verified
        if (user.isEmailVerified) {
            console.log('User already verified');
            return response(true, 200, 'Email already verified');
        }

        // Update verification status
        user.isEmailVerified = true;
        await user.save();

        console.log('User verified successfully');
        return response(true, 200, 'Email Verification Success.');

    } catch (error) {
        console.error('Verification error:', error);
        return catchError(error);
    }
}
