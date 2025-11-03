import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signToken, signRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Generate new tokens
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    const newToken = signToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        },
      },
      { status: 200 }
    );

    // Set new access token cookie (15 minutes)
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    // Set new refresh token cookie (7 days)
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
