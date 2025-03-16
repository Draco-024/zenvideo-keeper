
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import FavoritesPage from './pages/FavoritesPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import DownloadPage from './pages/DownloadPage';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useMatch } from 'react-router-dom';
import { SplashScreen } from './components/SplashScreen';
import './App.css';

const BackHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    // Enhanced back button handling
    const handleBackButton = (event: PopStateEvent) => {
      // If we're at home and user tries to go back, handle it specially
      if (isHomePage && window.history.state?.idx === 0) {
        // At home page and at first entry in history, show exit confirmation
        console.log('At home - would show exit confirmation in production');
        // In a mobile app, we would show a confirmation dialog
        /*
        if (window.confirm('Are you sure you want to exit the app?')) {
          // In a mobile context, this would exit the app
          // For web, we just let the browser handle it
        } else {
          // Prevent default back behavior
          history.pushState(null, '', window.location.href);
        }
        */
      }
    };

    // Handle swipe gestures for mobile (simple implementation)
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      // Detect right-to-left swipe (going forward)
      if (touchStartX - touchEndX > 100) {
        // Forward navigation logic if needed
      }
      
      // Detect left-to-right swipe (going back)
      if (touchEndX - touchStartX > 100) {
        // If not on home, go back
        if (!isHomePage) {
          navigate(-1);
        }
      }
    };

    window.addEventListener('popstate', handleBackButton);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, isHomePage]);

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
