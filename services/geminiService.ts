import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, AISuggestion, JudgeScore } from "../types";

// Next.js will automatically inject environment variables
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateHackathonTopic = async (): Promise<string> => {
  if (!ai) return "Dịch vụ AI không khả dụng. Vui lòng thử lại sau.";
  try {
    const prompt = `Tạo MỘT đề tài tranh luận chính sách độc đáo, chi tiết và cụ thể liên quan đến chủ đề "Kinh tế Việt Nam trong kỷ nguyên AI".

BỐI CẢNH: Đây là cuộc thi Vietnam Policy Hackathon & Debate tập trung vào tác động kinh tế của AI.

YÊU CẦU:
- Phải là câu hỏi hoặc thách thức chính sách rõ ràng, có thể thực hiện được
- Phải liên quan đến các lĩnh vực hoặc thách thức kinh tế cụ thể của Việt Nam
- Có thể bao gồm các chủ đề: Chatbot AI giáo dục lịch sử, AI trong hiện đại hóa nông nghiệp, chuyển đổi số cho doanh nghiệp vừa và nhỏ, đạo đức AI trong bối cảnh Việt Nam, đào tạo nguồn nhân lực AI, v.v.
- Phải thực tế và có thể triển khai trong bối cảnh Việt Nam
- Phải khác biệt với các đề tài phổ thông như "lợi ích AI" hay "rủi ro AI"

VÍ DỤ CÁC ĐỀ TÀI TỐT:
- "Làm thế nào để sử dụng chatbot AI dạy lịch sử Việt Nam một cách tương tác trong trường học và bảo tồn di sản văn hóa?"
- "Việt Nam nên thiết lập khung chính sách nào để quản lý việc sử dụng AI trong dịch vụ tài chính đồng thời thúc đẩy đổi mới fintech?"
- "Làm thế nào để nông nghiệp chính xác dựa trên AI giúp nông dân Việt Nam thích ứng với biến đổi khí hậu và tăng năng suất?"
- "Việt Nam có nên bắt buộc đào tạo về AI cho tất cả cán bộ công chức không? Thiết kế lộ trình triển khai 3 năm."
- "Làm thế nào Việt Nam tận dụng chatbot AI để cung cấp tư vấn pháp lý 24/7 cho các doanh nghiệp nhỏ điều hướng quy định phức tạp?"
- "Chính sách nào cần có để phát triển hệ sinh thái startup AI Việt Nam cạnh tranh với khu vực ASEAN?"
- "AI có thể hỗ trợ như thế nào trong việc bảo vệ và phát huy di sản văn hóa phi vật thể của Việt Nam?"

Tạo MỘT đề tài cụ thể, chi tiết bằng TIẾNG VIỆT ngay bây giờ:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Bạn là chuyên gia về chính sách kinh tế Việt Nam và công nghệ AI. Tạo CHỈ MỘT đề tài tranh luận chính sách cụ thể, chi tiết và độc đáo BẰNG TIẾNG VIỆT. Câu trả lời của bạn CHỈ là đề tài - không có phần giới thiệu, định dạng, giải thích, đánh số, hoặc tiền tố "Đề tài:". Chỉ là câu hỏi hoặc tuyên bố thách thức nguyên bản. Đề tài phải cụ thể trong bối cảnh và nền kinh tế Việt Nam. Tránh các đề tài chung chung. Mỗi lần tạo phải tạo ra một đề tài khác biệt đáng kể để đảm bảo sự đa dạng.`,
        temperature: 1.2,
        topP: 0.95,
        topK: 50,
      },
    });

    return response.text?.trim() || "Không thể tạo đề tài. Vui lòng thử lại.";
  } catch (error) {
    console.error("Error generating topic:", error);
    return "Không thể tạo đề tài. Vui lòng thử lại.";
  }
};

export const createChatSession = (topic?: string): Chat | null => {
  if (!ai) return null;

  const systemInstruction = `You are an expert AI Research Assistant for the Vietnam Policy Hackathon & Debate competition focused on "Vietnam's Economy in the AI Era" (Kinh tế Việt Nam trong kỷ nguyên AI).

YOUR ROLE:
- Help contestants research, brainstorm, and structure policy arguments
- Provide Vietnam-specific context, data, and examples
- Suggest credible sources (Vietnamese government reports, academic papers, ASEAN AI frameworks, local case studies)
- Guide debate preparation with pros/cons analysis
- Offer practical implementation strategies for Vietnamese context

EXPERTISE AREAS:
- AI applications in Vietnamese sectors (agriculture, education, healthcare, finance, manufacturing)
- Vietnamese economic policies and regulations
- AI chatbots for education, customer service, and historical preservation
- Digital transformation challenges in Vietnam
- AI ethics and responsible AI deployment in Southeast Asian context
- Vietnamese SME digitalization
- ASEAN AI governance frameworks

COMMUNICATION STYLE:
- Be encouraging and constructive
- Provide actionable, specific suggestions
- Use Vietnamese examples and context when relevant
- Structure responses clearly with bullet points
- Ask clarifying questions to better assist

${
  topic
    ? `CURRENT TOPIC: "${topic}"

Tailor all your responses to help contestants develop a comprehensive policy proposal for this specific topic. Focus on:
1. Current situation in Vietnam
2. Policy objectives and stakeholders
3. Implementation roadmap
4. Potential challenges and solutions
5. Success metrics and evaluation criteria`
    : ""
}`;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
      temperature: 0.8, // Balanced creativity and accuracy
    },
  });
};

export const getChatbotResponse = async (
  chat: Chat,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

const emptySuggestion: AISuggestion = {
  awareness: { score: 0, justification: "AI Service is not available." },
  creativity: { score: 0, justification: "AI Service is not available." },
  practicalImpact: { score: 0, justification: "AI Service is not available." },
  presentation: { score: 0, justification: "AI Service is not available." },
  ethics: { score: 0, justification: "AI Service is not available." },
};

export const getAIScoreSuggestion = async ({
  topic,
  notes,
  fileContent,
}: {
  topic: string;
  notes: string;
  fileContent?: string;
}): Promise<AISuggestion> => {
  if (!ai) return emptySuggestion;

  // Debug log to verify what AI receives
  console.log("[AI Scoring] Input:", {
    topic: topic.substring(0, 100) + "...",
    notes: notes.substring(0, 100) + "...",
    hasFileContent: !!fileContent,
    fileContentLength: fileContent?.length || 0,
  });

  try {
    const prompt = `Bạn là giám khảo chuyên nghiệp trong một cuộc thi tranh luận chính sách về "Kinh tế Việt Nam trong kỷ nguyên AI". Hãy đánh giá bài nộp sau:

ĐỀ TÀI: "${topic}"

GHI CHÚ CỦA THÍ SINH: "${notes}"

${
  fileContent
    ? `NỘI DUNG FILE BÀI THUYẾT TRÌNH:\n${fileContent.substring(0, 10000)}\n`
    : ""
}

Hãy đưa ra điểm số công bằng từ 0-20 và lý do ngắn gọn (1-2 câu) cho mỗi tiêu chí sau:

1. **Nhận thức (Awareness)**: Hiểu biết về vấn đề, bối cảnh Việt Nam, số liệu thực tế
2. **Sáng tạo (Creativity)**: Tính mới mẻ, độc đáo của giải pháp, cách tiếp cận khác biệt
3. **Tác động thực tiễn (Practical Impact)**: Khả năng triển khai, hiệu quả kinh tế-xã hội
4. **Trình bày (Presentation)**: Cấu trúc rõ ràng, lập luận mạch lạc, dễ hiểu
5. **Đạo đức (Ethics)**: Tính minh bạch, công bằng, bảo vệ quyền lợi người dùng

${
  !fileContent
    ? "\n⚠️ LƯU Ý: Chưa có file bài thuyết trình, chỉ đánh giá dựa trên ghi chú. Điểm có thể không chính xác hoàn toàn.\n"
    : ""
}`;

    const criterionSchema = {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.NUMBER,
          description: "Điểm từ 0 đến 20 cho tiêu chí này.",
        },
        justification: {
          type: Type.STRING,
          description: "Lý do ngắn gọn 1-2 câu cho điểm số.",
        },
      },
      required: ["score", "justification"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            awareness: criterionSchema,
            creativity: criterionSchema,
            practicalImpact: criterionSchema,
            presentation: criterionSchema,
            ethics: criterionSchema,
          },
          required: [
            "awareness",
            "creativity",
            "practicalImpact",
            "presentation",
            "ethics",
          ],
        },
        temperature: 0.3, // Lower for more consistent scoring
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Error getting AI score suggestion:", error);
    return {
      ...emptySuggestion,
      awareness: {
        score: 0,
        justification: "Failed to get an AI suggestion. Please score manually.",
      },
      creativity: {
        score: 0,
        justification: "Failed to get an AI suggestion. Please score manually.",
      },
      practicalImpact: {
        score: 0,
        justification: "Failed to get an AI suggestion. Please score manually.",
      },
      presentation: {
        score: 0,
        justification: "Failed to get an AI suggestion. Please score manually.",
      },
      ethics: {
        score: 0,
        justification: "Failed to get an AI suggestion. Please score manually.",
      },
    };
  }
};

export const analyzeScoringConsistency = async (
  judgeScore: JudgeScore,
  aiSuggestion: AISuggestion
): Promise<string | null> => {
  if (!ai) return null;

  const differences = (Object.keys(judgeScore) as Array<keyof JudgeScore>)
    .map((key) => ({
      criteria: key,
      judge: judgeScore[key],
      ai: aiSuggestion[key].score,
      diff: Math.abs(judgeScore[key] - aiSuggestion[key].score),
    }))
    .filter((d) => d.diff > 5); // Only flag differences greater than 5 points

  if (differences.length === 0) {
    return null; // No significant differences
  }

  try {
    const prompt = `You are a helpful assistant for a hackathon judge. A judge's scores have some significant differences from the AI's suggestions. Your task is to provide a single, concise, and constructive feedback sentence to help the judge reflect on their scoring. Do not be accusatory. Frame it as a helpful observation.
        
        Here are the discrepancies (criteria, judge's score, AI's score):
        ${differences
          .map((d) => `- ${d.criteria}: ${d.judge} vs ${d.ai}`)
          .join("\n")}

        Example feedback: "It looks like your scoring for 'Creativity' and 'Practical Impact' differs from the AI's analysis. This is perfectly fine, but you may wish to review it."
        
        Generate one sentence of feedback based on the provided discrepancies.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || null;
  } catch (error) {
    console.error("Error analyzing scoring consistency:", error);
    return "Could not perform consistency analysis at this time.";
  }
};
