// lib/helperFunction.js
import { NextResponse } from "next/server";

export const response = (success, statusCode, message, data = {}) => {
  return NextResponse.json(
    {
      success,
      statusCode,
      message,
      data
    },
    { status: statusCode }  // Add this - it was missing!
  );
};

export const catchError = (error, customMessage) => {
  // Handling Duplicate Error
  if (error.code === 11000) {
    const keys = Object.keys(error.keyPattern).join(',');
    error.message = `Duplicate field: ${keys}. These key values must be unique.`;
  }

  let errorMessage = error.message;
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
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  return otp
}