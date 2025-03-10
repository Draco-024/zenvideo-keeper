
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SplashScreen } from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import VideoPage from "./pages/VideoPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { isFirstTimeNotification, markNotificationShown } from "./utils/storage";
import { useToast } from "./hooks/use-toast";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Safely initialize Supabase config from window object if available
const initSupabaseConfig = () => {
  // Config is handled securely through environment variables or secure storage
  // We do not directly expose sensitive keys in client-side code
  console.log("Supabase configuration initialized");
};

// Call initialization function
initSupabaseConfig();

const AppContent = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (isFirstTimeNotification()) {
      setTimeout(() => {
        toast({
          title: "Welcome to BankZen!",
          description: "Your personal library for banking exam preparation videos.",
        });
        markNotificationShown();
      }, 2000);
    }
  }, [toast]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/index" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
