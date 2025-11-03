import { NextRequest, NextResponse } from "next/server";
import {
  createChatSession,
  getChatbotResponse,
} from "@/services/geminiService";
import { ChatMessage } from "@/types";

// Store chat sessions in memory (in production, use a proper session store)
const chatSessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, message, history, topic } = await request.json();

    if (action === "create") {
      const chat = createChatSession(topic);
      if (!chat) {
        return NextResponse.json(
          { error: "AI Service is not available" },
          { status: 503 }
        );
      }
      const newSessionId = `session-${Date.now()}`;
      chatSessions.set(newSessionId, chat);
      return NextResponse.json({ sessionId: newSessionId });
    }

    if (action === "send") {
      let chat = chatSessions.get(sessionId);

      if (!chat) {
        // Recreate session if not found
        chat = createChatSession(topic);
        if (!chat) {
          return NextResponse.json(
            { error: "AI Service is not available" },
            { status: 503 }
          );
        }
        chatSessions.set(sessionId, chat);
      }

      const response = await getChatbotResponse(chat, history || [], message);
      return NextResponse.json({ response });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
