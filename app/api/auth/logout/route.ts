import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Clear both tokens and redirect to landing page
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.delete("token");
  response.cookies.delete("refreshToken");

  return response;
}

// Support GET method for direct navigation
export async function GET(request: NextRequest) {
  // Clear both tokens and redirect to landing page
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.delete("token");
  response.cookies.delete("refreshToken");

  return response;
}
