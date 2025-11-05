"use client";

import React, { useState, useMemo } from "react";
import { Role, Team, Submission, User } from "../types";
import { useAppContext } from "../contexts/AppContext";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineLogout,
} from "react-icons/hi";

const RoleTag: React.FC<{ role: Role }> = ({ role }) => {
  if (role === Role.Admin) {
    return (
      <span className="text-xs font-bold px-2.5 py-1 bg-red-200 text-red-800 rounded-full">
        Admin
      </span>
    );
  }
  if (role === Role.Judge) {
    return (
      <span className="text-xs font-bold px-2.5 py-1 bg-sky-200 text-sky-800 rounded-full">
        Judge
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-full">
      Contestant
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full">
      {icon}
    </div>
    <div>
      <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold text-slate-900">{value}</dd>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    handleLogout,
    users,
    teams,
    submissions,
    isLoading,
    refreshData,
  } = useAppContext() as {
    currentUser: User;
    handleLogout: () => void;
    users: User[];
    teams: Team[];
    submissions: Submission[];
    isLoading: boolean;
    refreshData: () => Promise<void>;
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const totalSubmissions = submissions.length;
    const gradedSubmissions = teams.filter(
      (t) => (t.score?.final ?? 0) > 0
    ).length;

    let progress = 0;
    if (totalTeams > 0) {
      progress = Math.round((gradedSubmissions / totalTeams) * 100);
    }

    return {
      totalTeams,
      totalSubmissions,
      gradedSubmissions,
      progress,
    };
  }, [teams, submissions]);

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
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900">
              Admin Dashboard
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
            title="Refresh all data"
          >
            <HiOutlineRefresh
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="space-y-8 max-w-7xl mx-auto">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Teams"
            value={stats.totalTeams}
            icon={<HiOutlineUserGroup className="w-6 h-6" />}
          />
          <StatCard
            title="Submitted"
            value={`${stats.totalSubmissions} / ${stats.totalTeams}`}
            icon={<HiOutlineClipboardList className="w-6 h-6" />}
          />
          <StatCard
            title="Graded"
            value={`${stats.gradedSubmissions} / ${stats.totalSubmissions}`}
            icon={<HiOutlineCheckCircle className="w-6 h-6" />}
          />
          <StatCard
            title="Grading Progress"
            value={`${stats.progress}%`}
            icon={<HiOutlineClock className="w-6 h-6" />}
          />
        </dl>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
              <HiOutlineUsers className="h-6 w-6 text-slate-500" />
              User Management ({users.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-4">
                        <RoleTag role={user.role} />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {user.role === Role.Contestant ? user.teamName : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
              <HiOutlineClipboardList className="h-6 w-6 text-slate-500" />
              Submissions Overview
            </h2>
            {teams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {teams.map((team) => {
                      const submission = submissions.find(
                        (s) => s.teamId === team.id
                      );
                      const isGraded = (team.score?.final ?? 0) > 0;

                      return (
                        <tr key={team.id}>
                          <td className="px-4 py-4 font-medium text-slate-900">
                            {team.name}
                          </td>
                          <td className="px-4 py-4">
                            {!submission ? (
                              <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">
                                Pending
                              </span>
                            ) : isGraded ? (
                              <span className="text-xs font-bold px-2.5 py-1 bg-green-200 text-green-800 rounded-full">
                                Graded
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                                Submitted
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                No teams have registered yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
