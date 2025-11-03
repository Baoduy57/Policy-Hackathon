import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can view all users." },
        { status: 403 }
      );
    }

    await dbConnect();
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        role: u.role,
        teamId: u.teamId,
        teamName: u.teamName,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
