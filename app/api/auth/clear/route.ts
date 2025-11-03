import { NextRequest, NextResponse } from "next/server";

/**
 * Development-only endpoint to clear all auth cookies
 * Use this when you need to test login flow
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "All auth cookies cleared. You can now test login.",
  });

  // Clear all auth cookies
  response.cookies.delete("token");
  response.cookies.delete("refreshToken");

  return response;
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "All auth cookies cleared. You can now test login.",
  });

  // Clear all auth cookies
  response.cookies.delete("token");
  response.cookies.delete("refreshToken");

  return response;
}
