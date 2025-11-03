import { NextRequest, NextResponse } from "next/server";
import {
  getAIScoreSuggestion,
  analyzeScoringConsistency,
} from "@/services/geminiService";
import { JudgeScore, AISuggestion } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { action, topic, notes, fileContent, judgeScore, aiSuggestion } =
      await request.json();

    if (action === "suggest") {
      const suggestion = await getAIScoreSuggestion({
        topic,
        notes,
        fileContent,
      });
      return NextResponse.json({ suggestion });
    }

    if (action === "analyze") {
      const analysis = await analyzeScoringConsistency(
        judgeScore as JudgeScore,
        aiSuggestion as AISuggestion
      );
      return NextResponse.json({ analysis });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in score-suggestion API:", error);
    return NextResponse.json(
      { error: "Failed to process scoring request" },
      { status: 500 }
    );
  }
}
