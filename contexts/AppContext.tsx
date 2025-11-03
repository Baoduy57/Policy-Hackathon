"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Role, Team, Submission, JudgeScore } from "../types";

interface AppContextType {
  currentUser: User | null;
  teams: Team[];
  users: User[];
  submissions: Submission[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  handleAuthSuccess: (user: User, mode: "login" | "register") => void;
  handleLogout: () => void;
  handleSaveJudgeScore: (
    teamId: string,
    judgeId: string,
    judgeScore: JudgeScore,
    aiScore: number
  ) => void;
  handleAddSubmission: (submission: Submission) => void;
  handleResetSubmission: (teamId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// -------------------- HELPER FETCHES --------------------
async function fetchJSON(url: string) {
  const res = await fetch(url, { credentials: "include" });
  return res.ok ? res.json() : null;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -------------------- ROLE BASED DATA FETCH --------------------
  const fetchDataByRole = useCallback(async (role: Role) => {
    const teamsData = await fetchJSON("/api/teams");
    if (teamsData?.teams) setTeams(teamsData.teams);

    const subsData = await fetchJSON("/api/submissions");
    if (subsData?.submissions)
      setSubmissions(
        subsData.submissions.map((s: any) => ({
          teamId: s.teamId,
          teamName: s.teamName,
          topic: s.topic,
          notes: s.notes,
          fileName: s.fileName,
          fileId: s.fileId,
          fileSize: s.fileSize,
          submittedAt: new Date(s.submittedAt),
        }))
      );

    // Only ADMIN fetch users
    if (role === "admin") {
      const usersData = await fetchJSON("/api/users");
      if (usersData?.users) setUsers(usersData.users);
    }
  }, []);

  // -------------------- INITIAL AUTH CHECK --------------------
  useEffect(() => {
    // Nếu đang ở trang public → không fetch gì cả
    if (pathname === "/login" || pathname === "/register") {
      setIsLoading(false);
      return;
    }

    // PUBLIC: LOGIN & REGISTER → không fetch gì
    if (pathname === "/login" || pathname === "/register") {
      setIsLoading(false);
      return;
    }

    // PUBLIC: LANDING PAGE → fetch teams only (NO AUTH REQUIRED)
    if (pathname === "/") {
      const initPublic = async () => {
        const teamsData = await fetchJSON("/api/teams");
        if (teamsData?.teams) setTeams(teamsData.teams);
        setIsLoading(false);
      };
      initPublic();
      return;
    }

    // PRIVATE PATHS (role dashboards)
    const init = async () => {
      const meData = await fetchJSON("/api/auth/me");

      if (!meData?.user) {
        setIsLoading(false);
        return;
      }

      setCurrentUser(meData.user);
      await fetchDataByRole(meData.user.role);
      setIsLoading(false);
    };

    init();
  }, [pathname, fetchDataByRole]);

  // -------------------- ACTIONS --------------------
  const refreshData = useCallback(async () => {
    if (currentUser) await fetchDataByRole(currentUser.role);
  }, [currentUser, fetchDataByRole]);

  const handleAuthSuccess = useCallback(async (user: User) => {
    setCurrentUser(user);
    await new Promise((r) => setTimeout(r, 150));
    window.location.href = `/${user.role}/dashboard`;
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setTeams([]);
    setUsers([]);
    setSubmissions([]);
    router.push("/");
  }, [router]);

  const handleSaveJudgeScore = useCallback(
    async (
      teamId: string,
      judgeId: string,
      judgeScore: JudgeScore,
      aiScore: number
    ) => {
      try {
        console.log("[AppContext] Saving judge score:", {
          teamId,
          judgeId,
          judgeScore,
          aiScore,
        });

        const response = await fetch("/api/teams", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, judgeScore, aiScore }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[AppContext] Score saved successfully:", data);

          // Update local state
          setTeams((prevTeams) =>
            prevTeams.map((team) => {
              if (team.id === teamId) {
                return {
                  ...team,
                  score: data.team.score,
                  scoredBy: data.team.scoredBy,
                };
              }
              return team;
            })
          );
        } else {
          const error = await response.json();
          console.error("[AppContext] Failed to save score:", error);
        }
      } catch (error) {
        console.error("[AppContext] Error saving judge score:", error);
      }
    },
    []
  );
  const handleAddSubmission = useCallback(async (submission: Submission) => {
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: submission.teamId,
          teamName: submission.teamName,
          topic: submission.topic,
          notes: submission.notes,
          fileName: submission.fileName,
          fileUrl: `uploads/${submission.teamId}/${submission.fileName}`,

          fileSize: submission.file.size,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions((prev) => [
          ...prev.filter((s) => s.teamId !== submission.teamId),
          { ...submission, submittedAt: new Date(data.submission.submittedAt) },
        ]);
      }
    } catch (error) {
      console.error("Failed to add submission:", error);
    }
  }, []);

  const handleResetSubmission = () => {};

  return (
    <AppContext.Provider
      value={{
        currentUser,
        teams,
        users,
        submissions,
        isLoading,
        refreshData,
        handleAuthSuccess,
        handleLogout,
        handleSaveJudgeScore,
        handleAddSubmission,
        handleResetSubmission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
};
