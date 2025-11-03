"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Submission } from "../types";
import { generateHackathonTopic } from "../services/geminiServiceClient";
import {
  UploadIcon,
  TimerIcon,
  ChatIcon,
  SparklesIcon,
  RedrawIcon,
} from "./icons";
import Timer from "./Timer";
import Chatbot from "./Chatbot";
import UploadModal from "./UploadModal";
import { useAppContext } from "../contexts/AppContext";

const ContestantDashboard: React.FC = () => {
  const { currentUser, handleLogout, handleAddSubmission, isLoading } =
    useAppContext();
  const [topic, setTopic] = useState<string>("");
  const [isLoadingTopic, setIsLoadingTopic] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [redrawsUsed, setRedrawsUsed] = useState(0);

  const handleDrawTopic = useCallback(async () => {
    setIsLoadingTopic(true);
    const newTopic = await generateHackathonTopic();
    setTopic(newTopic);
    setIsLoadingTopic(false);
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setNotification(
        "Topic drawn! Your 15-minute preparation time has started."
      );
    }
  }, [isTimerRunning]);

  const handleRedraw = useCallback(() => {
    if (redrawsUsed < 1) {
      setRedrawsUsed((prev) => prev + 1);
      setNotification("Second chance! Re-drawing a new topic for you.");
      handleDrawTopic();
    }
  }, [redrawsUsed, handleDrawTopic]);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    setNotification("Time's up! Please submit your presentation slide.");
  }, []);

  const handleSubmissionSuccess = useCallback(
    (submission: Submission) => {
      handleAddSubmission(submission);
      setLastSubmission(submission);
      setShowUploadModal(false);
      setIsTimerRunning(false);
      setNotification(
        `Submission successful! Your slide for "${submission.topic}" has been received.`
      );
    },
    [handleAddSubmission]
  );

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const SubmissionSuccessView: React.FC<{ submission: Submission }> = ({
    submission,
  }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl h-full border-2 border-dashed border-green-300">
      <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-green-800 mb-2">
        Submission Received!
      </h2>
      <p className="text-slate-600 max-w-md">
        Thank you, your presentation has been successfully submitted. The judges
        will review it shortly. Good luck!
      </p>
      <div className="mt-6 text-left bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <p className="text-sm">
          <span className="font-semibold text-slate-700">File:</span>{" "}
          {submission.file.name}
        </p>
        <p className="text-sm">
          <span className="font-semibold text-slate-700">Topic:</span>{" "}
          {submission.topic}
        </p>
        <p className="text-sm">
          <span className="font-semibold text-slate-700">Submitted At:</span>{" "}
          {submission.submittedAt.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  if (!currentUser) {
    return null; // Should be handled by page-level redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {notification && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white font-bold py-3 px-6 rounded-lg shadow-2xl z-50 animate-fade-in-down">
          {notification}
        </div>
      )}

      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto pt-12">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900">
              Contestant Dashboard
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="text-slate-500 text-lg mt-1">
            Welcome,{" "}
            <span className="font-semibold text-slate-700">
              {currentUser.teamName}
            </span>
            !
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col">
          {lastSubmission ? (
            <SubmissionSuccessView submission={lastSubmission} />
          ) : (
            <div className="flex flex-col flex-grow">
              <div className="flex-grow bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg text-center flex flex-col items-center justify-center border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-600 mb-4">
                  Your AI-Generated Topic
                </h2>
                {isLoadingTopic ? (
                  <div className="flex flex-col items-center justify-center min-h-[150px] text-slate-600">
                    <SparklesIcon className="h-8 w-8 animate-pulse text-sky-500" />
                    <span className="font-medium mt-3 text-lg">
                      Generating your unique challenge...
                    </span>
                  </div>
                ) : topic ? (
                  <blockquote className="min-h-[150px] flex items-center justify-center">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 leading-relaxed">
                      "{topic}"
                    </p>
                  </blockquote>
                ) : (
                  <div className="min-h-[150px] flex flex-col items-center justify-center">
                    <p className="text-slate-500 text-lg">
                      Your mission awaits.
                    </p>
                    <p className="text-slate-400">
                      Click the button below to receive your topic!
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <button
                  onClick={handleDrawTopic}
                  disabled={!!topic || isLoadingTopic}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:from-slate-400 disabled:to-slate-500 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="h-6 w-6" />
                  {isLoadingTopic ? "Drawing Topic..." : "Draw My Topic!"}
                </button>
                {topic && redrawsUsed < 1 && (
                  <button
                    onClick={handleRedraw}
                    disabled={isLoadingTopic}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-600 font-bold rounded-lg shadow-md hover:bg-orange-50 border border-orange-300 transition-colors"
                  >
                    <RedrawIcon className="h-5 w-5" />
                    Re-draw (1 left)
                  </button>
                )}
                <button
                  onClick={() => setShowUploadModal(true)}
                  disabled={!topic}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  <UploadIcon className="h-5 w-5" />
                  Upload Slide
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
            <TimerIcon className="h-6 w-6 text-slate-500" />
            Preparation Time
          </h3>
          {isTimerRunning ? (
            <Timer duration={15 * 60} onTimeUp={handleTimeUp} />
          ) : (
            <div className="text-5xl font-bold text-slate-400 tracking-tight">
              {lastSubmission ? "00:00" : "15:00"}
            </div>
          )}
          <p className="text-sm text-slate-500 text-center max-w-xs">
            {lastSubmission
              ? `Submitted at ${lastSubmission.submittedAt.toLocaleTimeString()}`
              : "You have 15 minutes to prepare after drawing a topic."}
          </p>
        </div>
      </main>

      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-8 right-8 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-300"
        aria-label="Open AI Chatbot"
      >
        <ChatIcon className="h-8 w-8" />
      </button>

      {showChat && <Chatbot onClose={() => setShowChat(false)} topic={topic} />}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          teamId={currentUser.teamId!}
          teamName={currentUser.teamName!}
          topic={topic}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default ContestantDashboard;
