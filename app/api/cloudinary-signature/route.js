import { v2 as cloudinary } from 'cloudinary';
import { catchError } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const payload = await request.json();
    const { paramsToSign } = payload;

    // Generate signature using API SECRET (not upload preset!)
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({ signature });
    
  } catch (error) {
    console.error('Signature error:', error);
    catchError(error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
