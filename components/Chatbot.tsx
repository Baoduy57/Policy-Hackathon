import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import {
  createChatSession,
  getChatbotResponse,
} from "../services/geminiServiceClient";
import { SendIcon, CloseIcon } from "./icons";

interface ChatbotProps {
  onClose: () => void;
  topic?: string;
}

const SuggestedPrompts = [
  "Suggest 3 creative angles for this topic",
  "Find 2 relevant academic articles",
  "What are the key stakeholders to consider?",
  "Summarize the main challenge in simple terms",
];

const Chatbot: React.FC<ChatbotProps> = ({ onClose, topic }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSession = async () => {
      const newSessionId = await createChatSession(topic);
      setSessionId(newSessionId);
      const initialMessage = topic
        ? `Hello! I'm your AI Research Assistant. I can help you brainstorm and find sources for your topic: "${topic}". How can I assist?`
        : "Hello! I am your AI Research Assistant. How can I help you prepare for the hackathon?";
      setHistory([{ role: "model", text: initialMessage }]);
    };
    initSession();
  }, [topic]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async (messageToSend?: string) => {
    const currentMessage = messageToSend || input;
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    const userMessage: ChatMessage = { role: "user", text: currentMessage };
    setHistory((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const responseText = await getChatbotResponse(
      sessionId,
      history,
      currentMessage,
      topic
    );

    const modelMessage: ChatMessage = { role: "model", text: responseText };
    setHistory((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-full max-w-sm h-full max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 animate-fade-in-up">
      <header className="flex items-center justify-between p-4 border-b bg-slate-100 rounded-t-2xl">
        <h3 className="font-bold text-lg text-slate-800">
          AI Research Assistant
        </h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </header>
      <div
        ref={chatBodyRef}
        className="flex-grow p-4 overflow-y-auto space-y-4"
      >
        {history.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs break-words ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="p-4 border-t">
        {topic && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SuggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-grow px-4 py-2 border-2 border-slate-300 rounded-full focus:outline-none focus:border-blue-500"
            disabled={isLoading || !sessionId}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !sessionId || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;
