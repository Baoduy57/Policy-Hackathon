"use client";

import React, { useState, useMemo, useEffect } from "react";
import { JudgeScore, AISuggestion } from "../types";
import { DownloadIcon, ViewIcon } from "./icons";
import {
  getAIScoreSuggestion,
  analyzeScoringConsistency,
} from "../services/geminiServiceClient";
import { useAppContext } from "../contexts/AppContext";

interface JudgeDashboardProps {}

const ScoringCriteria: { id: keyof JudgeScore; name: string; max: number }[] = [
  { id: "awareness", name: "Awareness", max: 20 },
  { id: "creativity", name: "Creativity", max: 20 },
  { id: "practicalImpact", name: "Practical Impact", max: 20 },
  { id: "presentation", name: "Presentation", max: 20 },
  { id: "ethics", name: "Ethics", max: 20 },
];

const JudgeDashboard: React.FC<JudgeDashboardProps> = () => {
  const {
    currentUser,
    handleLogout,
    teams,
    submissions,
    handleSaveJudgeScore,
    isLoading,
    refreshData,
  } = useAppContext();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scores, setScores] = useState<Record<string, JudgeScore>>({});
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoadingAiScore, setIsLoadingAiScore] = useState(false);
  const [comments, setComments] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [lastScoredTeam, setLastScoredTeam] = useState<{
    name: string;
    score: number;
  } | null>(null);
  const [consistencyFeedback, setConsistencyFeedback] = useState<string | null>(
    null
  );
  const [showConsistencyModal, setShowConsistencyModal] = useState(false);

  const selectedTeamSubmission = useMemo(() => {
    if (!selectedTeamId) return null;
    return submissions.find((s) => s.teamId === selectedTeamId) || null;
  }, [selectedTeamId, submissions]);

  const selectedTeamScores = useMemo(() => {
    if (!selectedTeamId)
      return {
        awareness: 0,
        creativity: 0,
        practicalImpact: 0,
        presentation: 0,
        ethics: 0,
      };
    return (
      scores[selectedTeamId] || {
        awareness: 0,
        creativity: 0,
        practicalImpact: 0,
        presentation: 0,
        ethics: 0,
      }
    );
  }, [selectedTeamId, scores]);

  useEffect(() => {
    if (selectedTeamId) {
      setLastScoredTeam(null);
      if (selectedTeamSubmission) {
        console.log("[Judge] Selected submission:", {
          teamId: selectedTeamSubmission.teamId,
          fileId: selectedTeamSubmission.fileId,
          fileName: selectedTeamSubmission.fileName,
          fileSize: selectedTeamSubmission.fileSize,
        });

        setIsLoadingAiScore(true);
        setAiSuggestion(null);

        const getScoreWithFileContent = async () => {
          let fileContent: string | undefined = undefined;

          // Try to read file content if fileId exists
          if (selectedTeamSubmission.fileId) {
            try {
              console.log(
                "[Judge] Reading file from GridFS:",
                selectedTeamSubmission.fileId
              );
              const readResponse = await fetch("/api/read-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileId: selectedTeamSubmission.fileId,
                  fileName: selectedTeamSubmission.fileName,
                }),
              });

              if (readResponse.ok) {
                const readData = await readResponse.json();
                fileContent = readData.content;
                console.log(
                  `[Judge] File content read: ${readData.length} chars`
                );
              } else {
                console.warn("[Judge] Could not read file content");
              }
            } catch (error) {
              console.error("[Judge] Error reading file:", error);
            }
          }

          // Get AI suggestion with or without file content
          const suggestion = await getAIScoreSuggestion({
            topic: selectedTeamSubmission.topic,
            notes: selectedTeamSubmission.notes,
            fileContent,
          });

          setAiSuggestion(suggestion);
          setIsLoadingAiScore(false);
        };

        getScoreWithFileContent();
      } else {
        setAiSuggestion(null);
      }
    }
  }, [selectedTeamId, selectedTeamSubmission]);

  const handleScoreChange = (
    teamId: string,
    criteria: keyof JudgeScore,
    value: number
  ) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {
          awareness: 0,
          creativity: 0,
          practicalImpact: 0,
          presentation: 0,
          ethics: 0,
        }),
        [criteria]: value,
      },
    }));
  };

  const totalAiScore = useMemo(
    () =>
      aiSuggestion
        ? Object.values(aiSuggestion).reduce(
            (sum, criterion) => sum + criterion.score,
            0
          )
        : 0,
    [aiSuggestion]
  );
  const totalScore = useMemo(
    () =>
      selectedTeamId && scores[selectedTeamId]
        ? Object.values(scores[selectedTeamId]).reduce(
            (sum, score) => sum + (score as number),
            0
          )
        : 0,
    [selectedTeamId, scores]
  );

  const handleSaveAttempt = async () => {
    if (!selectedTeamId || !aiSuggestion) return;
    const feedback = await analyzeScoringConsistency(
      selectedTeamScores,
      aiSuggestion
    );
    setConsistencyFeedback(feedback);

    if (feedback) {
      setShowConsistencyModal(true);
    } else {
      confirmSaveScores();
    }
  };

  const confirmSaveScores = () => {
    if (!selectedTeamId || !currentUser) return;
    const teamName =
      teams.find((t) => t.id === selectedTeamId)?.name || "Unknown Team";
    handleSaveJudgeScore(
      selectedTeamId,
      currentUser.id,
      selectedTeamScores,
      totalAiScore
    );

    setLastScoredTeam({ name: teamName, score: totalScore });
    setSelectedTeamId(null);
    setComments("");
    setShowConsistencyModal(false);
  };

  const scoredByThisJudge = useMemo(
    () =>
      currentUser
        ? teams.filter((t) =>
            t.scoredBy?.some((s) => s.judgeId === currentUser.id)
          ).length
        : 0,
    [teams, currentUser]
  );
  const progress =
    teams.length > 0 ? (scoredByThisJudge / teams.length) * 100 : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  if (!currentUser) {
    return null; // Handled by page-level redirect
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
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto pt-12">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900">
              Judge Dashboard
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="text-slate-500 text-lg mt-1">
            Welcome,{" "}
            <span className="font-semibold text-slate-700">
              {currentUser.email}
            </span>
            !
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh data to see new submissions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">
            Teams & Submissions
          </h2>
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 mb-2">
              Your Progress: {scoredByThisJudge} / {teams.length} teams scored
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {teams.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="font-medium mb-2">No teams registered yet</p>
              <p className="text-sm">
                Waiting for contestants to register and submit their
                presentations.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {teams.map((team) => {
                const isScoredByThisJudge = team.scoredBy?.some(
                  (s) => s.judgeId === currentUser.id
                );
                const submission = submissions.find(
                  (s) => s.teamId === team.id
                );
                return (
                  <li key={team.id}>
                    <button
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        selectedTeamId === team.id
                          ? "bg-sky-100 text-sky-800"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{team.name}</span>
                        {isScoredByThisJudge ? (
                          <span className="text-xs font-bold px-2.5 py-1 bg-blue-200 text-blue-800 rounded-full">
                            Scored
                          </span>
                        ) : submission ? (
                          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-200 text-emerald-800 rounded-full">
                            Submitted
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <main className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
          {selectedTeamId ? (
            <div>
              <h2 className="text-3xl font-bold mb-1 text-slate-900">
                {teams.find((t) => t.id === selectedTeamId)?.name}
              </h2>
              <p className="text-base text-slate-500 mb-6">
                Topic: {selectedTeamSubmission?.topic || "Not submitted yet"}
              </p>
              {selectedTeamSubmission ? (
                <div className="mb-8">
                  <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">
                      {selectedTeamSubmission.fileName}
                    </span>
                    <div className="flex-grow"></div>
                    {selectedTeamSubmission.fileId ? (
                      <>
                        <button
                          onClick={() => setShowPdfPreview(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-sky-200"
                        >
                          <ViewIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">Xem</span>
                        </button>

                        <a
                          href={`/api/preview/${selectedTeamSubmission.fileId}`}
                          download={selectedTeamSubmission.fileName}
                          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                          title="Tải xuống bài thuyết trình"
                        >
                          <DownloadIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">Tải xuống</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-sm text-amber-600 italic">
                        File chưa upload
                      </span>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Ghi chú của thí sinh:</strong>{" "}
                      {selectedTeamSubmission.notes || "(Không có ghi chú)"}
                    </p>
                  </div>
                  {selectedTeamSubmission.fileId && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      AI đang đọc và phân tích{" "}
                      <strong>nội dung file PDF</strong> từ data để đánh giá
                      chính xác.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg text-slate-500 bg-slate-50">
                  <p className="text-lg font-semibold mb-2">Chưa có bài nộp</p>
                  <p className="text-sm">Đội này chưa nộp bài thuyết trình.</p>
                </div>
              )}

              <div className="space-y-6">
                {ScoringCriteria.map((criteria) => (
                  <div key={criteria.id}>
                    <label
                      htmlFor={criteria.id}
                      className="flex justify-between font-semibold text-slate-700 mb-2"
                    >
                      <span>{criteria.name}</span>
                      <span className="font-bold text-slate-800">
                        {selectedTeamScores[criteria.id]} / {criteria.max}
                      </span>
                    </label>
                    <input
                      type="range"
                      id={criteria.id}
                      min="0"
                      max={criteria.max}
                      value={selectedTeamScores[criteria.id]}
                      onChange={(e) =>
                        handleScoreChange(
                          selectedTeamId,
                          criteria.id,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      disabled={!selectedTeamSubmission}
                    />
                    {isLoadingAiScore ? (
                      <div className="h-12 bg-slate-200 rounded-md w-full mt-2 animate-pulse"></div>
                    ) : (
                      aiSuggestion && (
                        <div className="mt-2 text-sm text-sky-800 bg-sky-50 p-3 rounded-md border border-sky-100">
                          <span className="font-semibold">
                            AI Suggestion: {aiSuggestion[criteria.id].score}/
                            {criteria.max}.
                          </span>
                          <span className="italic ml-1">
                            "{aiSuggestion[criteria.id].justification}"
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex justify-between items-center mt-4">
                  <div className="text-2xl font-bold text-slate-800">
                    Your Final Score:{" "}
                    <span className="text-emerald-600">{totalScore}/100</span>
                  </div>
                  {aiSuggestion && (
                    <div className="text-xl font-semibold text-sky-800">
                      AI Total:{" "}
                      <span className="text-sky-600">{totalAiScore}/100</span>
                    </div>
                  )}
                </div>
                <textarea
                  className="mt-4 w-full p-3 border-2 border-slate-200 rounded-lg text-slate-900 bg-slate-50 focus:ring-sky-500 focus:border-sky-500"
                  rows={3}
                  placeholder="Add comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></textarea>
                <div className="text-right mt-4">
                  <button
                    onClick={handleSaveAttempt}
                    disabled={!selectedTeamSubmission}
                    className="px-8 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Scores
                  </button>
                </div>
              </div>
            </div>
          ) : lastScoredTeam ? (
            <div className="p-8 border-2 border-dashed border-sky-300 bg-sky-50 rounded-xl text-center h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-sky-800 mb-2">
                Scoring Complete!
              </h2>
              <p className="text-slate-600">
                You have successfully submitted the scores for team{" "}
                <span className="font-bold">{lastScoredTeam.name}</span>.
              </p>
              <div className="mt-4 text-left bg-white p-4 rounded-md inline-block shadow-sm border border-slate-200">
                <p>
                  <span className="font-semibold">Team:</span>{" "}
                  {lastScoredTeam.name}
                </p>
                <p>
                  <span className="font-semibold">Your Final Score:</span>{" "}
                  {lastScoredTeam.score} / 100
                </p>
              </div>
              <p className="mt-6 text-slate-500">
                Please select the next team from the list to continue.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-8">
              {teams.length === 0 ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-24 h-24 mb-4 text-slate-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    Waiting for Teams
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    No teams have registered yet. Once contestants register and
                    submit their presentations, you'll be able to review and
                    score them here.
                  </p>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-20 h-20 mb-4 text-slate-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    Ready to Score
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    Select a team from the list to begin reviewing their
                    presentation and submitting scores.
                  </p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
      {showConsistencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Scoring Consistency Check
            </h3>
            <p className="text-slate-600 mb-4 text-base">
              {consistencyFeedback}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              This is just a suggestion to ensure fairness. You can proceed with
              your current scores or go back to edit them.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConsistencyModal(false)}
                className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Go Back & Edit
              </button>
              <button
                onClick={confirmSaveScores}
                className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-700 transition-colors"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showPdfPreview && selectedTeamSubmission?.fileId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] rounded-lg shadow-xl relative overflow-hidden">
            <button
              onClick={() => setShowPdfPreview(false)}
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
            >
              Đóng
            </button>

            <iframe
              src={`/api/preview/${selectedTeamSubmission.fileId}`}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
