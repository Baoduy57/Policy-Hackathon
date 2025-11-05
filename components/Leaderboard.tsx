import React, { useMemo } from "react";
import { Team } from "../types";
import { FaTrophy } from "react-icons/fa";

interface LeaderboardProps {
  teams: Team[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams }) => {
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score.final - a.score.final);
  }, [teams]);

  const getRowClass = (rank: number) => {
    if (rank === 1) return "bg-yellow-50/70";
    if (rank === 2) return "bg-gray-100/70";
    if (rank === 3) return "bg-orange-50/70";
    return "";
  };

  const renderRank = (rank: number) => {
    const iconBaseClasses = "w-6 h-6 mx-auto";
    if (rank === 1) {
      return <FaTrophy className={`${iconBaseClasses} text-yellow-500`} />;
    }
    if (rank === 2) {
      return <FaTrophy className={`${iconBaseClasses} text-gray-500`} />;
    }
    if (rank === 3) {
      return <FaTrophy className={`${iconBaseClasses} text-orange-600`} />;
    }

    return (
      <span className="text-base font-semibold text-gray-700">{rank}</span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Team
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-36"
              >
                BGK Score
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-36"
              >
                AI Score
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-36"
              >
                Final Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTeams.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No teams have submitted yet.
                </td>
              </tr>
            )}
            {sortedTeams.map((team, index) => {
              const rank = index + 1;
              return (
                <tr key={team.id} className={getRowClass(rank)}>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {renderRank(rank)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold text-gray-900">
                      {team.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-base text-gray-600">
                    {team.score.bgk.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-base text-gray-600">
                    {team.score.ai.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-sky-600">
                    {team.score.final.toFixed(2)}
                  </td>
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
