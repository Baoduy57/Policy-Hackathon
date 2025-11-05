import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";
import { getUserFromRequest } from "@/lib/auth";

// GET all teams
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const teams = await Team.find({}).sort({ "score.final": -1 });

    return NextResponse.json({
      success: true,
      teams: teams.map((team) => ({
        id: team.teamId,
        name: team.name,
        members: team.members,
        score: team.score,
        scoredBy: team.scoredBy,
      })),
    });
  } catch (error: any) {
    console.error("Get teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// UPDATE team score (for judges)
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "judge") {
      return NextResponse.json(
        { error: "Unauthorized. Only judges can score teams." },
        { status: 403 }
      );
    }

    await dbConnect();

    const { teamId, judgeScore, aiScore } = await request.json();

    if (!teamId || !judgeScore) {
      return NextResponse.json(
        { error: "Team ID and judge score are required" },
        { status: 400 }
      );
    }

    // Calculate total BGK score
    const bgkScore = Object.values(judgeScore).reduce(
      (sum: number, score: any) => sum + score,
      0
    );
    
    // Calculate final score as the mean of judge score and AI score
    const aiTotalScore = aiScore || 0;
    const finalScore = aiTotalScore > 0 
      ? Math.round((bgkScore + aiTotalScore) / 2) 
      : bgkScore;

    // Update team score
    const team = await Team.findOne({ teamId });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Update or add judge score
    const judgeIndex = team.scoredBy.findIndex(
      (s: any) => s.judgeId === user.userId
    );
    if (judgeIndex >= 0) {
      team.scoredBy[judgeIndex].score = finalScore;
    } else {
      team.scoredBy.push({ judgeId: user.userId, score: finalScore });
    }

    team.score = { bgk: bgkScore, ai: aiScore || 0, final: finalScore };
    await team.save();

    return NextResponse.json({
      success: true,
      team: {
        id: team.teamId,
        name: team.name,
        score: team.score,
        scoredBy: team.scoredBy,
      },
    });
  } catch (error: any) {
    console.error("Update team score error:", error);
    return NextResponse.json(
      { error: "Failed to update team score" },
      { status: 500 }
    );
  }
}
