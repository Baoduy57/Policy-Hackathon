"use client";

import React, { useState } from "react";
import { Role } from "../types";
import { UsersIcon, ClipboardListIcon } from "./icons";
import { useAppContext } from "../contexts/AppContext";

const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    handleLogout,
    users,
    teams,
    submissions,
    isLoading,
    refreshData,
  } = useAppContext();
  const judges = users.filter((u) => u.role === Role.Judge);
  const contestants = users.filter((u) => u.role === Role.Contestant);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

      <main className="space-y-8 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
            <UsersIcon className="h-6 w-6 text-slate-500" />
            User Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-700 text-lg">
                Judges ({judges.length})
              </h3>
              <ul className="mt-2 space-y-2 text-base text-slate-600 list-disc list-inside">
                {judges.length > 0 ? (
                  judges.map((j) => (
                    <li key={j.id}>
                      <span className="ml-2">{j.email}</span>
                    </li>
                  ))
                ) : (
                  <li className="list-none text-slate-400">
                    No judges registered.
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 text-lg">
                Contestants ({contestants.length})
              </h3>
              <ul className="mt-2 space-y-2 text-base text-slate-600 list-disc list-inside">
                {contestants.length > 0 ? (
                  contestants.map((c) => (
                    <li key={c.id}>
                      <span className="ml-2">
                        {c.email} (
                        <span className="font-medium text-slate-800">
                          {c.teamName}
                        </span>
                        )
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="list-none text-slate-400">
                    No contestants registered.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-3">
            <ClipboardListIcon className="h-6 w-6 text-slate-500" />
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
                    return (
                      <tr key={team.id}>
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {team.name}
                        </td>
                        <td className="px-4 py-4">
                          {submission ? (
                            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-200 text-emerald-800 rounded-full">
                              Submitted
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">
                              Pending
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
      </main>
    </div>
  );
};

export default AdminDashboard;
