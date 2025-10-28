import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const response = (success, statusCode, message, data = {}) => {
  return NextResponse.json(
    {
      success,
      statusCode,
      message,
      data
    },
    { status: statusCode }
  );
};

export const catchError = (error, customMessage) => {
  // Handling Duplicate Error
  if (error.code === 11000) {
    const keys = Object.keys(error.keyPattern).join(',');
    error.message = `Duplicate field: ${keys}. These key values must be unique.`;
  }

  let errorObj = {};

  if (process.env.NODE_ENV === "development") {
    errorObj = {
      message: error.message,
      error: error.stack
    };
  } else {
    errorObj = {
      message: customMessage || 'Internal Server Error.'
    };
  }

  return response(false, error.statusCode || 500, errorObj.message, errorObj);
};

export const ganerateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

export const isAuthenticated = async (role) => {
  try {
    const cookieStore = await cookies();

    if (!cookieStore.has('access_token')) {
      return { isAuth: false };
    }

    const access_token = cookieStore.get('access_token');
    
    // Fixed: .encode() not .encoded()
    const { payload } = await jwtVerify(
      access_token.value, 
      new TextEncoder().encode(process.env.SECRET_KEY)
    );

    if (role && payload.role !== role) {
      return { isAuth: false };
    }

    return {
      isAuth: true,
      userId: payload._id
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      isAuth: false,
      error: error.message
    };
  }
}
