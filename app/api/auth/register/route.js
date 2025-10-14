// import { connectDB } from "@/lib/detabaseConnection";
// import { response } from "@/lib/helperFunction";
// import { LoginSchema } from "@/lib/zodSchema";
// import { emailVerificationLink } from "@/mail/emailLinkVerification";
// import UserModel from "@/models/User.model";
// import { SignJWT } from "jose";

// export async function POST(request) {
//     try {
//         await connectDB()
//         // Validation Schema 
//         const validationShema = LoginSchema.pick({
//             name:true,email:true,password:true
//         })

//         const payload = await request.json()

//         const validatedData = validationShema.safeParse(payload)

//         if(!validatedData.success) {
//             return response(false, 401, 'Invalid or missing Input field.',validatedData.error)

//             const {name , email, password} = validatedData.data


//             // Check Already User Registered
//             const checkUser = await UserModel.exists({email})
//             if(checkUser) {
//                 return response(true,409,'User Already Registered')
//             }

//             // new Registration

//             const newRegisteration = new UserModel({
//                 name, email,password
//             })

//             await newRegisteration.save()

//             const secret = new TextEncoder().encode(process.env.SECRET_KEY)
//             const token = await new SignJWT({userId:newRegisteration._id})
//             setIssusedAt();
//             setExpirationTime('1h')
//             setProtectedHeader({alg:'HS256'})
//             .sign(secret)

//             await sendEmail('Email Verification request from Developer Abu Salim',
//                 email,emailVerificationLink(`${process.env.NEXT_PUBLIC_BASE_URL}/verify-email ${token}`))
//                 return response(true, 200, 'Registration Success, please verify your email address')
//         }

//     }
//     catch{
//         catchError(error)
//     }
// }



import { connectDB } from "@/lib/detabaseConnection";
import { response, catchError } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import { emailVerificationLink } from "@/mail/emailLinkVerification";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { sendMail } from "@/lib/sendMail";

export async function POST(request) {
  try {
    await connectDB();

    const validationSchema = LoginSchema.pick({
      name: true,
      email: true,
      password: true
    });

    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 400, 'Invalid or missing input field.', validatedData.error);
    }

    const { name, email, password } = validatedData.data;

    const checkUser = await UserModel.exists({ email });
    if (checkUser) {
      return response(false, 409, 'User Already Registered');
    }

    const newRegistration = new UserModel({
      name,
      email,
      password
    });

    await newRegistration.save();

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ userId: newRegistration._id })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`;

    const emailHTML = emailVerificationLink(verificationLink);
    
    // Updated: Match your sendMail parameter order (subject, receiver, body)
    const emailResult = await sendMail(
      'Email Verification - Developer Abu Salim',  // subject
      email,                                        // receiver
      emailHTML                                     // body
    );

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.message);
      // User is registered but email failed - you might want to handle this
    }

    return response(true, 201, 'Registration successful! Please check your email to verify your account.');

  } catch (error) {
    return catchError(error);
  }
}
