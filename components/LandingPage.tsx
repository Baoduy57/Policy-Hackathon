'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Leaderboard from './Leaderboard';
import { useAppContext } from '../contexts/AppContext';

const LandingPage: React.FC = () => {
  const { teams } = useAppContext();

  const scoredTeams = useMemo(() => {
    return teams.filter(team => team.score.final > 0);
  }, [teams]);

  return (
    <>
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl font-black text-white sm:text-6xl tracking-tight">
              Policy Hackathon
            </h1>
            <h2 className="mt-2 text-3xl font-bold text-sky-400 sm:text-4xl">
              Kinh tế Việt Nam trong kỷ nguyên AI
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Join us to innovate and shape the future of Vietnam's economy through AI-driven policy solutions. Collaborate, create, and compete with the brightest minds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-sky-500 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 transition-transform transform hover:scale-105"
              >
                Register Now
              </Link>
              <Link
                href="/login"
                className="text-lg font-semibold leading-6 text-white hover:text-sky-300"
              >
                Login <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <main className="py-16 sm:py-24 bg-slate-100">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-10">Live Leaderboard</h3>
            {scoredTeams.length > 0 ? (
              <Leaderboard teams={scoredTeams} />
            ) : (
              <div className="text-center bg-white p-12 rounded-xl shadow-md border border-slate-200">
                <p className="text-slate-500 text-lg">No teams have been scored yet.</p>
                <p className="text-slate-400 mt-2">Results will appear here live once judging is complete.</p>
              </div>
            )}
        </div>
      </main>
    </>
  );
};

export default LandingPage;
