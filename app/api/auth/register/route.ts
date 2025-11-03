import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Team from "@/models/Team";
import { signToken, signRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, role, teamName } = await request.json();

    // Normalize role to lowercase
    const normalizedRole = role?.toLowerCase();

    // Validation
    if (!email || !password || !normalizedRole) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (normalizedRole === "contestant" && !teamName) {
      return NextResponse.json(
        { error: "Team name is required for contestants" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create team if contestant
    let teamId: string | undefined;
    if (normalizedRole === "contestant") {
      teamId = `team-${Date.now()}`;
      const newTeam = await Team.create({
        teamId,
        name: teamName,
        members: [email.toLowerCase()],
        score: { bgk: 0, ai: 0, final: 0 },
        scoredBy: [],
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
      teamId,
      teamName: normalizedRole === "contestant" ? teamName : undefined,
    });

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          teamName: user.teamName,
        },
      },
      { status: 201 }
    );

    // Set access token cookie (15 minutes)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    // Set refresh token cookie (7 days)
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
