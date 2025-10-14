import { SignJWT } from 'jose';
import { connectDB } from "@/lib/detabaseConnection";
import { catchError, ganerateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { LoginSchema } from "@/lib/zodSchema";
import { emailVerificationLink } from "@/mail/emailLinkVerification";
import { otpEmail } from "@/mail/otpEmail";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import z from "zod";

export async function POST(request) {
  try {
    console.log('=== LOGIN API STARTED ===');
    
    console.log('1. Connecting to DB...');
    await connectDB();
    console.log('✓ DB Connected');
    
    console.log('2. Parsing request...');
    const payload = await request.json();
    console.log('✓ Payload received:', payload);

    const validationSchema = LoginSchema
      .pick({
        email: true,
      })
      .extend({
        password: z.string(),
      });

    console.log('3. Validating data...');
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      console.log('✗ Validation failed:', validatedData.error);
      return response(
        false,
        401,
        "Invalid or missing input field.",
        validatedData.error
      );
    }
    console.log('✓ Validation passed');

    const { email, password } = validatedData.data;

    console.log('4. Finding user...');
    const getUser = await UserModel.findOne({ deletedAt:null ,email }).select("+password");
    if (!getUser) {
      console.log('✗ User not found');
      return response(false, 400, "Invalid login Credentials.");
    }
    console.log('✓ User found:', getUser.email);

    // Email verification check
    if (!getUser.isEmailVerified) {
      console.log('5. Email not verified, sending verification link...');
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({ userId: getUser._id })
        .setIssuedAt()
        .setExpirationTime("1h")
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);

      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`;
      const emailHTML = emailVerificationLink(verificationLink);

      const emailResult = await sendMail(
        "Email Verification - Developer Abu Salim",
        email,
        emailHTML
      );

      return response(
        false,
        401,
        "Your email is not verified. We have sent a verification link to your registered email address."
      );
    }

    console.log('6. Verifying password...');
    const isPasswordVerified = await getUser.comparePassword(password);

    if (!isPasswordVerified) {
      console.log('✗ Password verification failed');
      return response(false, 400, "Invalid login Credentials.");
    }
    console.log('✓ Password verified');

    console.log('7. Deleting old OTPs...');
    await OTPModel.deleteMany({email});
    console.log('✓ Old OTPs deleted');

    console.log('8. Generating new OTP...');
    const otp = ganerateOTP();
    console.log('✓ OTP generated:', otp);

    console.log('9. Saving OTP to database...');
    const newOtpData = new OTPModel({
        email,
        otp
    });
    await newOtpData.save();
    console.log('✓ OTP saved');

    console.log('10. Sending OTP email...');
    const otpEmailStatus = await sendMail('Your Login Verification code', email, otpEmail(otp));
    console.log('✓ Email sent status:', otpEmailStatus);

    if(!otpEmailStatus) {
        console.log('✗ Failed to send OTP email');
        return response(false, 400, 'Failed to send OTP.');
    }

    console.log('=== LOGIN API SUCCESS ===');
    return response(true, 200, 'Please verify your device');

  } catch (error) {
    console.error('=== LOGIN API ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    return catchError(error);
  }
}
