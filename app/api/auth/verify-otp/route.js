import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { cookies } from "next/headers";


export async function POST(request) {
    try {
        await connectDB();
        const payload = await request.json()
        const validatedSchema = LoginSchema.pick({
            otp:true,email:true
        })

        const validatedData = validatedSchema.safeParse(payload)
        if(!validatedData.success) {
            return response(false,401,'invalid or missing input field.', validatedData.error)
        }

        const {email,otp} = validatedData.data

        const getOtpData = await OTPModel.findOne({email,otp})

        if(!getOtpData) {
            return response(false,404,'Invalid or expired otp.')
        }

        const getUser = await UserModel.findOne({deletedAt:null,email}).lean()
        if(!getUser) {
            return response(false, 404,'user not found.')
        }

        const loggedInUserData = {
            _id:getUser._id,
            role:getUser.role,
            name:getUser.email,
            avatar:getUser.avatar,
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const token = await new SignJWT(loggedInUserData)
        .setIssuedAt()
        .setExpirationTime('24h')
    .setProtectedHeader({alg:'HS256'})
    .sign(secret)

     const cookieStore = await cookies()
     cookieStore.set({
        name:'access_token',
        value: token,
        httpOnly:process.env.NODE_ENV === 'production',
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'lax',
     })

     // remove otp after validation
     await getOtpData.deleteOne()

     return response(true,200,'Login SuccessFull')
     
    } catch (error) {
        console.error('Verification error:', error);
        return catchError(error);
    }
}
