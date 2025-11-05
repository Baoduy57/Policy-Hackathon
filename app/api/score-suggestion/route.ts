import { NextRequest, NextResponse } from "next/server";
import {
  getAIScoreSuggestion,
  analyzeScoringConsistency,
} from "@/services/geminiService";
import { JudgeScore, AISuggestion } from "@/types";
import { downloadFromGridFS } from "@/lib/gridfs";

export async function POST(request: NextRequest) {
  try {
    const { action, topic, notes, fileId, fileName, judgeScore, aiSuggestion } =
      await request.json();

    if (action === "suggest") {
      // Download PDF buffer from GridFS if fileId provided
      let fileBuffer: Buffer | undefined;
      if (fileId) {
        try {
          console.log("[Score API] Downloading file from GridFS:", fileId);
          fileBuffer = await downloadFromGridFS(fileId);
          console.log("[Score API] ✅ File downloaded:", fileBuffer.length, "bytes");
        } catch (error) {
          console.error("[Score API] Failed to download file:", error);
        }
      }

      const suggestion = await getAIScoreSuggestion({
        topic,
        notes,
        fileBuffer,
        fileName,
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
