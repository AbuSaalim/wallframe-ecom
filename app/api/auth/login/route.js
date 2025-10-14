import { connectDB } from "@/lib/detabaseConnection";
import { catchError, ganerateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import { emailVerificationLink } from "@/mail/emailLinkVerification";
import { otpEmail } from "@/mail/otpEmail";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import z from "zod";
import { id } from "zod/v4/locales";

export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json();

    const validationSchema = zSchema
      .pick({
        email: true,
      })
      .extend({
        password: z.string(),
      });

    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(
        false,
        401,
        "Invalid or missing input field.",
        validatedData.error
      );
    }

    const { email, password } = validatedData.data;

    // get user data

    const getUser = await UserModel.findOne({ email });
    if (!getUser) {
      return response(false, 400, "Invalid login Crediantials.");
    }

    // Resent Email Verification Link
    if (!getUser.isEmailVerified) {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({ userId: getUser._id })
        .setIssuedAt()
        .setExpirationTime("1h")
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);

      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`;
      const emailHTML = emailVerificationLink(verificationLink);

      // Updated: Match your sendMail parameter order (subject, receiver, body)
      const emailResult = await sendMail(
        "Email Verification - Developer Abu Salim", // subject
        email, // receiver
        emailHTML // body
      );

      return response(
        false,
        401,
        "Your email is not verified. we have sent a verification link to your registered email address."
      );
    }

    // Password verification
    const isPasswordVerified = await getUser.comparePassword(password);

    if (!isPasswordVerified) {
      return response(false, 400, "Invalid login Crediantials.");
    }

    // otp generation 

    await OTPModel.deleteMany({email}) // deleting old otp

    const otp = ganerateOTP()

    // storing otp into database
    const newOtpData = new OTPModel({
        email,otp
    })

    await newOtpData.save()

    const otpEmailStatus = await sendMail('Your Login Verifivation code', email, otpEmail(otp))

    if(!otpEmailStatus) {
        response(false, 400, 'Failed To send Otp.')
    }

    response(true, 200, 'Plaese verify Your device')

  } catch (error) {
    return catchError(error);
  }
}
