
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { OctopusLogo, MOCK_USERS } from './constants';
import LoadingScreen from './components/LoadingScreen';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import EventsPage from './pages/EventsPage';
import VolunteersPage from './pages/VolunteersPage';
import DonatePage from './pages/DonatePage';
import LeaderboardPage from './pages/LeaderboardPage';
import BlogPage from './pages/BlogPage';
import ProfilePage from './pages/ProfilePage';
import EventDetailPage from './pages/EventDetailPage';
import VolunteerDetailPage from './pages/VolunteerDetailPage';

const Layout: React.FC<{ children: React.ReactNode, darkMode: boolean, toggleDarkMode: () => void }> = ({ children, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900 text-white' : 'bg-brand-light text-slate-900'}`}>
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-brand/10 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <OctopusLogo className="w-8 h-8 text-brand" />
                <span className="text-2xl font-black text-brand tracking-tighter">8VENTS</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', path: '/' },
                { name: 'Events', path: '/events' },
                { name: 'Volunteers', path: '/volunteers' },
                { name: 'Donate', path: '/donate' },
                { name: 'Leaderboard', path: '/leaderboard' },
                { name: 'Blog', path: '/blog' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-semibold transition-colors hover:text-brand ${
                    isActive(item.path) ? 'text-brand' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand/10 transition-colors"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.242 16.242l.707.707M7.758 7.758l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <Link to="/profile/2" className="hidden sm:block">
                <img src={MOCK_USERS[1].avatar} className="w-8 h-8 rounded-full border-2 border-brand" alt="Profile" />
              </Link>
              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-brand/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <OctopusLogo className="w-6 h-6 text-brand" />
            <span className="text-xl font-bold text-brand">8VENTS</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 8vents Community. Handcrafted for a better tomorrow.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-brand transition-colors">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-brand transition-colors">GitHub</a>
            <a href="#" className="text-slate-400 hover:text-brand transition-colors">Discord</a>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (loading) return <LoadingScreen />;

  return (
    <HashRouter>
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/volunteers/:id" element={<VolunteerDetailPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
