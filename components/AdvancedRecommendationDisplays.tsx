import React, { useState, useEffect } from 'react';
import { getUserRecommendations } from '../analytics/recommendationEngine';
import { UserRecommendation } from '../analytics/types';

interface AdvancedDisplayProps {
  userId?: number;
  maxDisplay?: number;
}

/**
 * TIMELINE/PATH MODE - Shows matching journey progression
 * Great for: Educational storytelling, trust building
 */
export const TimelineRecommendations: React.FC<AdvancedDisplayProps> = ({ userId = 1, maxDisplay = 3 }) => {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getUserRecommendations(userId, 'volunteer', { maxRecommendations: maxDisplay });
        if (result.success) setRecommendations(result.data.slice(0, maxDisplay));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, maxDisplay]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {recommendations.map((rec, idx) => (
        <div key={idx} className="relative">
          {/* Timeline Line */}
          {idx < recommendations.length - 1 && (
            <div className="absolute left-6 top-14 w-1 h-20 bg-gradient-to-b from-brand to-slate-200 dark:to-slate-700" />
          )}

          {/* Timeline Dot */}
          <div className="flex items-start gap-6">
            <div className="relative z-10 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg">
              {rec.matchScore}%
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <h4 className="text-lg font-bold mb-4">{rec.recommendedUserName}</h4>

              {/* Match Criteria Breakdown */}
              <div className="space-y-3">
                {rec.matchReasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {reason.type.charAt(0).toUpperCase() + reason.type.slice(1)}
                        </p>
                        <p className="text-xs font-bold text-brand">
                          {Math.round(reason.weight * 100)}%
                        </p>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand to-blue-500 rounded-full"
                          style={{ width: `${reason.weight * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-2 bg-brand/10 text-brand rounded-lg font-semibold text-sm hover:bg-brand/20 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * RADAR CHART MODE - Polygonal match visualization
 * Great for: Data-driven users, detailed comparison
 */
export const RadarChartRecommendations: React.FC<AdvancedDisplayProps> = ({ userId = 1, maxDisplay = 2 }) => {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getUserRecommendations(userId, 'volunteer', { maxRecommendations: maxDisplay });
        if (result.success) setRecommendations(result.data.slice(0, maxDisplay));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, maxDisplay]);

  if (loading) return <div>Loading...</div>;

  // Simulate radar data from match reasons
  const getRadarData = (rec: UserRecommendation) => {
    const weightMap = rec.matchReasons.reduce((acc, r) => {
      acc[r.type] = r.weight * 100;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: 'Language', value: weightMap['language'] || 0 },
      { label: 'Interest', value: weightMap['interest'] || 0 },
      { label: 'Location', value: weightMap['location'] || 0 },
      { label: 'Cultural', value: weightMap['cultural'] || 0 },
      { label: 'History', value: weightMap['history'] || 0 }
    ];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {recommendations.map((rec, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold">
              {rec.matchScore}%
            </div>
            {rec.recommendedUserName}
          </h4>

          {/* SVG Radar Chart */}
          <svg viewBox="0 0 200 200" className="w-full h-auto mb-6">
            {/* Grid circles */}
            {[20, 40, 60, 80, 100].map(r => (
              <circle
                key={r}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-200 dark:text-slate-700"
              />
            ))}

            {/* Axes */}
            {[0, 1, 2, 3, 4].map(i => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = 100 + 100 * Math.cos(angle);
              const y = 100 + 100 * Math.sin(angle);
              return (
                <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" />
              );
            })}

            {/* Data polygon */}
            <polygon
              points={getRadarData(rec)
                .map((d, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const r = (d.value / 100) * 100;
                  const x = 100 + r * Math.cos(angle);
                  const y = 100 + r * Math.sin(angle);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />

            {/* Labels */}
            {getRadarData(rec).map((d, i) => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = 100 + 130 * Math.cos(angle);
              const y = 100 + 130 * Math.sin(angle);
              return (
                <text
                  key={d.label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-slate-600 dark:fill-slate-400"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>

          <div className="space-y-2 text-sm">
            {getRadarData(rec).map(d => (
              <div key={d.label} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{d.label}</span>
                <span className="font-bold text-brand">{Math.round(d.value)}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * GAMIFIED MODE - Fun, engaging match cards
 * Great for: User engagement, retention
 */
export const GamifiedRecommendations: React.FC<AdvancedDisplayProps> = ({ userId = 1, maxDisplay = 4 }) => {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getUserRecommendations(userId, 'volunteer', { maxRecommendations: maxDisplay });
        if (result.success) setRecommendations(result.data.slice(0, maxDisplay));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, maxDisplay]);

  if (loading) return <div>Loading...</div>;

  const getBadge = (matchScore: number) => {
    if (matchScore >= 90) return { label: '🔥 Perfect Match', color: 'from-red-400 to-red-600' };
    if (matchScore >= 80) return { label: '⭐ Great Match', color: 'from-yellow-400 to-yellow-600' };
    if (matchScore >= 70) return { label: '💚 Good Match', color: 'from-green-400 to-green-600' };
    return { label: '👍 Nice Match', color: 'from-blue-400 to-blue-600' };
  };

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl p-4 text-center">
          <div className="text-3xl font-black">{recommendations.length}</div>
          <div className="text-xs font-semibold mt-1">Matches Found</div>
        </div>
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 text-white rounded-2xl p-4 text-center">
          <div className="text-3xl font-black">{likedUsers.length}</div>
          <div className="text-xs font-semibold mt-1">Favorites</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl p-4 text-center">
          <div className="text-3xl font-black">
            {recommendations.length > 0
              ? Math.round(
                  recommendations.reduce((sum, r) => sum + r.matchScore, 0) / recommendations.length
                )
              : 0}
            %
          </div>
          <div className="text-xs font-semibold mt-1">Avg. Match</div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const badge = getBadge(rec.matchScore);
          const isLiked = likedUsers.includes(rec.recommendedUserId);

          return (
            <div
              key={idx}
              className="group bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-700 hover:border-brand/50 transition-all cursor-pointer overflow-hidden relative"
            >
              {/* Badge */}
              <div className={`absolute top-4 right-4 bg-gradient-to-r ${badge.color} text-white px-4 py-1 rounded-full text-xs font-bold`}>
                {badge.label}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {rec.recommendedUserName}
                  </h4>

                  {/* Match Score Circle */}
                  <div className="inline-block mb-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                    <span className="text-2xl font-black text-brand">{rec.matchScore}%</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">match score</span>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 space-y-2">
                    {rec.sharedInterests.slice(0, 3).map(interest => (
                      <div key={interest} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">⚡</span>
                        <span className="text-slate-700 dark:text-slate-300">{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setLikedUsers(isLiked ? likedUsers.filter(u => u !== rec.recommendedUserId) : [...likedUsers, rec.recommendedUserId])
                    }
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform transform group-hover:scale-110 ${
                      isLiked ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button className="w-full py-4 bg-gradient-to-r from-brand to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all">
        ✨ View All {recommendations.length} Matches
      </button>
    </div>
  );
};

/**
 * COMPARISON MATRIX MODE - Heatmap-style grid
 * Great for: Analytics, understanding patterns
 */
export const ComparisonMatrixRecommendations: React.FC<AdvancedDisplayProps> = ({ userId = 1, maxDisplay = 5 }) => {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getUserRecommendations(userId, 'volunteer', { maxRecommendations: maxDisplay });
        if (result.success) setRecommendations(result.data.slice(0, maxDisplay));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, maxDisplay]);

  if (loading) return <div>Loading...</div>;

  const criteria = ['Language', 'Interest', 'Location', 'Cultural', 'Overall'];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100';
    return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <th className="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">Volunteer</th>
            {criteria.map(c => (
              <th key={c} className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-300 text-sm">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recommendations.map((rec, idx) => (
            <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{rec.recommendedUserName}</td>
              {criteria.map(criterion => {
                let score = 0;
                if (criterion === 'Overall') {
                  score = rec.matchScore;
                } else {
                  const reason = rec.matchReasons.find(r => r.type.includes(criterion.toLowerCase()));
                  score = reason ? Math.round(reason.weight * 100) : 0;
                }

                return (
                  <td key={criterion} className="px-4 py-4 text-center">
                    <div className={`inline-block px-3 py-2 rounded-lg font-bold text-sm ${getScoreColor(score)}`}>
                      {score}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default {
  TimelineRecommendations,
  RadarChartRecommendations,
  GamifiedRecommendations,
  ComparisonMatrixRecommendations
};
