import React, { useState, useEffect } from 'react';

interface MatchReason {
  type: 'language' | 'interest' | 'location' | 'history' | 'cultural';
  description: string;
  weight: number;
}

interface UserRecommendation {
  recommendedUserId: string;
  recommendedUserName: string;
  matchScore: number;
  matchReasons: MatchReason[];
  sharedInterests: string[];
  culturalConnection: string;
  suggestedActivities: string[];
}

interface RecommendedVolunteersProps {
  userId?: number;
  displayMode?: 'cards' | 'list' | 'carousel';
  maxDisplay?: number;
}

const RecommendedVolunteers: React.FC<RecommendedVolunteersProps> = ({ 
  userId = 1, 
  displayMode = 'cards',
  maxDisplay = 4 
}) => {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Fetch from backend recommendations API
        // The backend server (server.js) runs on port 3001
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? '/api/recommendations'
          : 'http://localhost:3001/api/recommendations';
        
        const resp = await fetch(`${baseUrl}?userId=${userId}&max=${maxDisplay}`);
        
        if (resp.ok) {
          const json = await resp.json();
          
          if (json && json.success && Array.isArray(json.data)) {
            setRecommendations(json.data.slice(0, maxDisplay));
          } else if (Array.isArray(json)) {
            setRecommendations(json.slice(0, maxDisplay));
          } else {
            throw new Error('Invalid recommendations response format');
          }
        } else {
          throw new Error(`API returned ${resp.status}`);
        }
      } catch (fetchErr) {
        console.warn('Failed to fetch recommendations from API:', fetchErr);
        // Fallback to demo recommendations
        const fallbackRecommendations: UserRecommendation[] = [
          {
            recommendedUserId: 'v1',
            recommendedUserName: 'Alex Tentacle',
            matchScore: 92,
            matchReasons: [{ type: 'interest', description: 'Shared interest: Beach Cleanup', weight: 0.3 }],
            sharedInterests: ['Beach Cleanup', 'Teaching'],
            culturalConnection: 'Great community partner',
            suggestedActivities: ['Beach cleanup events', 'Community teaching programs']
          },
          {
            recommendedUserId: 'v2',
            recommendedUserName: 'Jordan Rivers',
            matchScore: 85,
            matchReasons: [{ type: 'interest', description: 'Shared interest: Education', weight: 0.3 }],
            sharedInterests: ['Education'],
            culturalConnection: 'Compatible goals',
            suggestedActivities: ['Education volunteer programs']
          }
        ];
        setRecommendations(fallbackRecommendations.slice(0, maxDisplay));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, maxDisplay]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 text-center">
        <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-slate-600 dark:text-slate-400 font-semibold">No volunteer matches yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Select interests in your profile to see matching volunteers with shared passions</p>
      </div>
    );
  }

  // Filter to only show recommendations with shared interests
  const validRecommendations = recommendations.filter(rec => rec.sharedInterests && rec.sharedInterests.length > 0);

  if (displayMode === 'carousel') {
    if (validRecommendations.length === 0) {
      return (
        <div className="p-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-dashed border-blue-200 dark:border-slate-700 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">No volunteer matches found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Volunteers with your shared interests will appear here</p>
        </div>
      );
    }

    const current = validRecommendations[activeIndex];
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-brand/10 to-brand-dark/10 rounded-3xl p-8 border border-brand/20">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-brand font-bold uppercase tracking-wider mb-2">
                Perfect Match • {current.matchScore}% Compatible
              </p>
              <h3 className="text-3xl font-bold">{current.recommendedUserName}</h3>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-brand mb-2">{current.matchScore}%</div>
              <p className="text-xs text-slate-500 font-semibold">Match Score</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Why You Match</p>
              <div className="space-y-2">
                {current.matchReasons.slice(0, 3).map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">{reason.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {current.sharedInterests.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shared Interests</p>
                <div className="flex flex-wrap gap-2">
                  {current.sharedInterests.slice(0, 4).map(interest => (
                    <span key={interest} className="text-xs bg-brand/20 text-brand px-3 py-1 rounded-full font-semibold">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {current.suggestedActivities.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Activities</p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {current.suggestedActivities.map(activity => (
                    <li key={activity} className="flex items-center gap-2">
                      <span className="text-brand">→</span> {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="w-full mt-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors">
            Connect with {current.recommendedUserName.split(' ')[0]}
          </button>
        </div>

        {/* Carousel Navigation */}
        <div className="flex gap-2 justify-center">
          {validRecommendations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === activeIndex ? 'bg-brand w-8' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              aria-label={`Show recommendation ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (displayMode === 'list') {
    if (validRecommendations.length === 0) {
      return (
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-600 dark:text-slate-400 font-semibold">No volunteer matches with shared interests</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {validRecommendations.map((rec, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white">{rec.recommendedUserName}</h4>
              <p className="text-xs text-slate-500 mt-1">{rec.matchReasons[0]?.description || 'Great match'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-black text-brand">{rec.matchScore}%</div>
                <p className="text-xs text-slate-400 font-semibold">Match</p>
              </div>
              <button className="px-4 py-2 bg-brand/10 text-brand rounded-lg font-bold text-sm hover:bg-brand/20 transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: cards
  if (validRecommendations.length === 0) {
    return (
      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
        <p className="text-slate-600 dark:text-slate-400 font-semibold">No volunteer matches with shared interests</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {validRecommendations.map((rec, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-brand/30 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{rec.recommendedUserName}</h4>
              <p className="text-xs text-brand font-semibold mt-1">{rec.matchScore}% Match</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
              <span className="text-white font-black text-sm">{rec.matchScore}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Match Reasons</p>
              {rec.matchReasons.slice(0, 2).map((reason, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  • {reason.description}
                </p>
              ))}
            </div>

            {rec.sharedInterests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {rec.sharedInterests.slice(0, 2).map(interest => (
                  <span key={interest} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <button className="w-full mt-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold text-sm hover:bg-brand hover:text-white transition-colors">
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedVolunteers;
