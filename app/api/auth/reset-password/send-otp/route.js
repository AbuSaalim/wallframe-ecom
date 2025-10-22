import { connectDB } from "@/lib/detabaseConnection";
import { catchError, ganerateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { LoginSchema } from "@/lib/zodSchema";
import { otpEmail } from "@/mail/otpEmail";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validationSchema = LoginSchema.pick({
            email:true
        })

        const validationData = validationSchema.safeParse(payload)
        if (!validationData.success) {
            return response(false, 401, 'invalid or missing input feild.', validationData.error)
        }

        const {email} = validationData.data

        const getUser = await UserModel.findOne({deletedAt:null,email}).lean()

        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        // remove old otp
        
                await OTPModel.deleteMany({email})
                const otp = ganerateOTP()
                const newOtpData = new OTPModel({
                    email,otp
                })
        
                await newOtpData.save()
        
                const otpSendStatus = await sendMail('your login verification code.', email,otpEmail(otp))
        
                if(!otpSendStatus.success) {
                    return response(false,404,'Failed to resend otp.')
        
                }
                return response(true,200,'Please verify your account.')

    } catch (error) {
        catchError(error)
    }
}