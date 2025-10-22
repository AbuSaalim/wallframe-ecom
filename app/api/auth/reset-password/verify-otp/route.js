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

      

     // remove otp after validation
     await getOtpData.deleteOne()

     return response(true,200,'otp verified')
     
    } catch (error) {
        console.error('Verification error:', error);
        return catchError(error);
    }
}
