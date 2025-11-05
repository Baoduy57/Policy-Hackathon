export enum Role {
  Contestant = "contestant",
  Judge = "judge",
  Admin = "admin",
}

export interface User {
  id: string;
  email: string;
  role: Role;
  teamId?: string;
  teamName?: string;
}

export interface Score {
  bgk: number;
  ai: number;
  final: number;
}

export interface JudgeScore {
  knowledgeApplication: number;
  criticalThinkingLogic: number;
  expressionStyle: number;
  ethics: number;
  socialImpact: number;
}

export interface AIScoreCriterion {
  score: number;
  justification: string;
}

export interface AISuggestion {
  knowledgeApplication: number;
  criticalThinkingLogic: number;
  expressionStyle: number;
  ethics: number;
  socialImpact: number;
  totalScore: number;
  rating: string;
  feedback: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  topic?: string;
  score: Score;
  scoredBy?: { judgeId: string; score: number }[];
}

export interface Submission {
  teamId: string;
  teamName: string;
  file: File;
  fileId?: string; // MongoDB GridFS ObjectId
  fileName?: string; // Original filename
  fileSize?: number; // File size in bytes
  fileUrl?: string; // Deprecated - kept for backward compatibility
  notes: string;
  submittedAt: Date;
  topic: string;
}

// The 'View' type is no longer needed in Next.js routing model.
// export type View = 'landing' | 'login' | 'register' | 'contestant_dashboard' | 'judge_dashboard' | 'admin_dashboard';

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
