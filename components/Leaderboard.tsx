import React, { useMemo } from 'react';
import { Team } from '../types';

interface LeaderboardProps {
  teams: Team[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams }) => {

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score.final - a.score.final);
  }, [teams]);
  
  const getRankPill = (rank: number) => {
    const baseClasses = "flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold";
    if (rank === 1) return `${baseClasses} bg-amber-400 text-amber-900 border-2 border-amber-500`;
    if (rank === 2) return `${baseClasses} bg-slate-300 text-slate-800 border-2 border-slate-400`;
    if (rank === 3) return `${baseClasses} bg-yellow-600 text-white border-2 border-yellow-700`;
    return `${baseClasses} bg-slate-200 text-slate-700 border-2 border-slate-300`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Rank</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Team</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">BGK Score</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">AI Score</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Final Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedTeams.map((team, index) => {
              const rank = index + 1;
              return (
                <tr key={team.id} className={rank <= 3 ? '' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <span className={getRankPill(rank)}>
                          {rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold text-slate-900">{team.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-base text-slate-600">{team.score.bgk.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-base text-slate-600">{team.score.ai.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-base font-bold text-sky-600">{team.score.final.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
