import { NextResponse } from "next/server";
import { generateHackathonTopic } from "@/services/geminiService";

export async function POST() {
  try {
    const topic = await generateHackathonTopic();
    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Error in generate-topic API:", error);
    return NextResponse.json(
      { error: "Failed to generate topic" },
      { status: 500 }
    );
  }
}
