import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";
import Submission from "@/models/Submission";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({});
    const teams = await Team.find({});
    const submissions = await Submission.find({});

    return NextResponse.json({
      success: true,
      debug: {
        users: {
          count: users.length,
          list: users.map(u => ({
            email: u.email,
            role: u.role,
            teamId: u.teamId,
            teamName: u.teamName,
          })),
        },
        teams: {
          count: teams.length,
          list: teams.map(t => ({
            teamId: t.teamId,
            name: t.name,
            score: t.score,
          })),
        },
        submissions: {
          count: submissions.length,
          list: submissions.map(s => ({
            teamId: s.teamId,
            teamName: s.teamName,
            topic: s.topic,
            fileName: s.fileName,
            submittedAt: s.submittedAt,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
