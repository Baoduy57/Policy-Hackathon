import { ChatMessage, AISuggestion, JudgeScore } from "@/types";

// Client-side API wrapper for generating hackathon topics
export const generateHackathonTopic = async (): Promise<string> => {
  try {
    const response = await fetch("/api/generate-topic", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to generate topic");
    }

    const data = await response.json();
    return data.topic;
  } catch (error) {
    console.error("Error generating topic:", error);
    return "Failed to generate a topic. Please try again or use a default one.";
  }
};

// Client-side API wrapper for chat functionality
export const createChatSession = async (
  topic?: string
): Promise<string | null> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", topic }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
};

export const getChatbotResponse = async (
  sessionId: string,
  history: ChatMessage[],
  message: string,
  topic?: string
): Promise<string> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        sessionId,
        message,
        history,
        topic,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

// Client-side API wrapper for AI scoring
export const getAIScoreSuggestion = async ({
  topic,
  notes,
  fileContent,
}: {
  topic: string;
  notes: string;
  fileContent?: string;
}): Promise<AISuggestion> => {
  const emptySuggestion: AISuggestion = {
    awareness: { score: 0, justification: "AI Service is not available." },
    creativity: { score: 0, justification: "AI Service is not available." },
    practicalImpact: {
      score: 0,
      justification: "AI Service is not available.",
    },
    presentation: { score: 0, justification: "AI Service is not available." },
    ethics: { score: 0, justification: "AI Service is not available." },
  };

  try {
    const response = await fetch("/api/score-suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suggest", topic, notes, fileContent }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI suggestion");
    }

    const data = await response.json();
    return data.suggestion;
  } catch (error) {
    console.error("Error getting AI score suggestion:", error);
    return emptySuggestion;
  }
};

export const analyzeScoringConsistency = async (
  judgeScore: JudgeScore,
  aiSuggestion: AISuggestion
): Promise<string | null> => {
  try {
    const response = await fetch("/api/score-suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "analyze",
        judgeScore,
        aiSuggestion,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Error analyzing scoring consistency:", error);
    return null;
  }
};
