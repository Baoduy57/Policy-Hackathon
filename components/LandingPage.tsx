"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Leaderboard from "./Leaderboard";
import { useAppContext } from "../contexts/AppContext";

const LandingPage: React.FC = () => {
  const { teams } = useAppContext();

  const scoredTeams = useMemo(() => {
    return teams.filter((team) => team.score.final > 0);
  }, [teams]);

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white min-h-screen">
      {/* Hero Section */}
      <header className="pt-24 pb-20 text-center px-6 animate-fade-in">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-300">
          Policy Hackathon 2025
        </h1>
        <h2 className="mt-4 text-2xl sm:text-4xl font-semibold text-sky-300">
          Kinh tế Việt Nam trong kỷ nguyên AI
        </h2>
        <p className="mt-6 max-w-3xl mx-auto text-slate-300 text-lg leading-relaxed">
          Thúc đẩy tư duy chính sách đổi mới, ứng dụng AI để định hình tương lai
          nền kinh tế Việt Nam. Hợp tác – Sáng tạo – Cạnh tranh – Bứt phá.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/register"
            className="rounded-xl bg-sky-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-sky-700/20 hover:bg-sky-400 transition-transform hover:scale-105"
          >
            Đăng ký ngay
          </Link>
          <Link
            href="/login"
            className="text-lg font-medium text-slate-200 hover:text-sky-300 transition-colors"
          >
            Đăng nhập →
          </Link>
        </div>
      </header>

      {/* Leaderboard Section */}
      <main className="py-20 bg-slate-100 text-slate-800 rounded-t-3xl">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-10">
            Bảng Xếp Hạng Trực Tuyến
          </h3>
          {scoredTeams.length > 0 ? (
            <Leaderboard teams={scoredTeams} />
          ) : (
            <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-slate-200">
              <p className="text-slate-600 text-lg font-medium">
                Chưa có đội nào được chấm điểm.
              </p>
              <p className="text-slate-400 mt-2 text-sm">
                Kết quả sẽ hiển thị trực tiếp sau khi chấm xong.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
