import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecommendedVolunteers from '../components/RecommendedVolunteers';
import {
  TimelineRecommendations,
  RadarChartRecommendations,
  GamifiedRecommendations,
  ComparisonMatrixRecommendations
} from '../components/AdvancedRecommendationDisplays';

const RecommendationDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'carousel' | 'cards' | 'list' | 'timeline' | 'radar' | 'gamified' | 'matrix'>('carousel');

  const tabs = [
    { id: 'carousel', label: '✨ Carousel', description: 'Featured hero display' },
    { id: 'cards', label: '📋 Cards', description: 'Gallery grid view' },
    { id: 'list', label: '📝 List', description: 'Compact list view' },
    { id: 'timeline', label: '📍 Timeline', description: 'Matching journey' },
    { id: 'radar', label: '📊 Radar', description: 'Data visualization' },
    { id: 'gamified', label: '🎮 Gamified', description: 'Engagement-focused' },
    { id: 'matrix', label: '🔲 Matrix', description: 'Comparison table' }
  ] as const;

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <Link to="/" className="text-brand font-bold hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl lg:text-5xl font-black mb-4">
          AI Recommendation <br /> Display Modes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Explore different ways to showcase AI-powered volunteer matching. Each mode offers unique benefits
          for different use cases and user engagement goals.
        </p>
      </section>

      {/* Tab Navigation */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative py-3 px-2 rounded-xl font-semibold text-sm text-center transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <div>{tab.label}</div>
              <div className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                {tab.description}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Display Container */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-slate-700 min-h-[600px]">
        <div className="space-y-6">
          {/* Mode Header */}
          <div>
            {activeTab === 'carousel' && (
              <>
                <h2 className="text-2xl font-bold mb-2">✨ Carousel Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Perfect for homepage hero section. Shows featured recommendation with detailed match reasoning
                  and swipeable navigation. High engagement, story-driven approach.
                </p>
              </>
            )}
            {activeTab === 'cards' && (
              <>
                <h2 className="text-2xl font-bold mb-2">📋 Cards Grid Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Gallery view for browsing multiple recommendations. Clean grid layout with quick-glance match scores
                  and hover effects. Great for discovery and comparison.
                </p>
              </>
            )}
            {activeTab === 'list' && (
              <>
                <h2 className="text-2xl font-bold mb-2">📝 List Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Compact, scannable format. Ideal for sidebars, secondary panels, and mobile views. Quick action buttons
                  and sorted by compatibility score.
                </p>
              </>
            )}
            {activeTab === 'timeline' && (
              <>
                <h2 className="text-2xl font-bold mb-2">📍 Timeline Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Shows matching journey progression. Visualizes how users align on different criteria. Educational
                  and builds trust in the algorithm.
                </p>
              </>
            )}
            {activeTab === 'radar' && (
              <>
                <h2 className="text-2xl font-bold mb-2">📊 Radar Chart Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Polygonal data visualization. Shows match dimensions at a glance. Perfect for power users and
                  detailed technical analysis.
                </p>
              </>
            )}
            {activeTab === 'gamified' && (
              <>
                <h2 className="text-2xl font-bold mb-2">🎮 Gamified Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Game-like interaction with badges, favorites, and scoring. Highly engaging with emotional appeal.
                  Great for retention and user engagement.
                </p>
              </>
            )}
            {activeTab === 'matrix' && (
              <>
                <h2 className="text-2xl font-bold mb-2">🔲 Comparison Matrix Mode</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Heatmap-style comparison table. Shows multiple criteria across volunteers. Ideal for analytics
                  dashboards and understanding patterns.
                </p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="mt-8">
            {activeTab === 'carousel' && (
              <RecommendedVolunteers displayMode="carousel" maxDisplay={4} />
            )}
            {activeTab === 'cards' && (
              <RecommendedVolunteers displayMode="cards" maxDisplay={6} />
            )}
            {activeTab === 'list' && (
              <RecommendedVolunteers displayMode="list" maxDisplay={5} />
            )}
            {activeTab === 'timeline' && (
              <TimelineRecommendations maxDisplay={3} />
            )}
            {activeTab === 'radar' && (
              <RadarChartRecommendations maxDisplay={2} />
            )}
            {activeTab === 'gamified' && (
              <GamifiedRecommendations maxDisplay={4} />
            )}
            {activeTab === 'matrix' && (
              <ComparisonMatrixRecommendations maxDisplay={5} />
            )}
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-2">🎯 Best For Homepage</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Use <strong>Carousel</strong> mode for your hero section. It creates an engaging first impression with detailed
            match reasoning.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-2">🔍 Best For Discovery</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Use <strong>Cards</strong> or <strong>Gamified</strong> mode for a dedicated recommendations page to encourage
            exploration.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-2">📱 Best For Mobile</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Use <strong>List</strong> or <strong>Gamified</strong> mode for mobile views. They're compact and finger-friendly.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-2">📊 Best For Analytics</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Use <strong>Matrix</strong> or <strong>Radar</strong> mode for admin dashboards and data-driven insights.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-2">✨ Best For Storytelling</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Use <strong>Timeline</strong> mode to explain how the algorithm works and build user trust.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-2">🎮 Best For Engagement</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Use <strong>Gamified</strong> mode to increase user interaction and retention with fun interactions.
          </p>
        </div>
      </section>

      {/* Technical Details */}
      <section className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold mb-6">⚙️ Technical Implementation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Component Props</h3>
            <code className="bg-white dark:bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300 block overflow-x-auto">
              {`<RecommendedVolunteers
  displayMode="carousel" | "cards" | "list"
  maxDisplay={4}
  userId={currentUser.id}
/>`}
            </code>
          </div>

          <div>
            <h3 className="font-bold mb-3">Advanced Components</h3>
            <code className="bg-white dark:bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300 block overflow-x-auto">
              {`import {
  TimelineRecommendations,
  RadarChartRecommendations,
  GamifiedRecommendations,
  ComparisonMatrixRecommendations
} from '...AdvancedDisplays'`}
            </code>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-300 dark:border-blue-700">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Pro Tip:</strong> All components are optimized for lazy loading, caching, and dark mode. They respect
            your app's theme and use the same analytics backend.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-brand to-blue-600 text-white rounded-3xl p-8 lg:p-12 text-center">
        <h2 className="text-3xl font-black mb-4">Ready to Implement?</h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          All components are fully integrated and ready to use. Pick your favorite display mode and start showing your users
          amazing AI-powered recommendations!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 bg-white text-brand rounded-2xl font-bold hover:bg-slate-50 transition-colors"
          >
            View on Homepage
          </Link>
          <button className="px-8 py-4 bg-white/20 border-2 border-white text-white rounded-2xl font-bold hover:bg-white/30 transition-colors">
            Read Full Guide
          </button>
        </div>
      </section>
    </div>
  );
};

export default RecommendationDemoPage;
