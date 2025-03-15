
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import FavoritesPage from './pages/FavoritesPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import DownloadPage from './pages/DownloadPage';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SplashScreen } from './components/SplashScreen';
import './App.css';

const BackHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      // Normal back button behavior is preserved for navigation
      // History handling is managed by React Router
      
      // Optionally, you could show a confirmation when trying to exit the app
      if (location.pathname === '/' && window.history.state?.idx === 0) {
        // We're at the home page and at the first entry in history stack
        // Could show a confirmation dialog here if desired
        // For now, we'll let the default behavior handle it
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate, location]);

  return <>{children}</>;
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {loading ? (
        <SplashScreen />
      ) : (
        <BackHandler>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BackHandler>
      )}
    </Router>
  );
};

export default App;
