import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to MongoDB",
      },
      { status: 500 }
    );
  }
}
