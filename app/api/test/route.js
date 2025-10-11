import { connectDB } from "@/lib/detabaseConnection";
import { NextResponse } from "next/server";

export async function GET(params) {
  await connectDB();
  return NextResponse.json({
    success: true,
    message: "connection Success",
  });
}
