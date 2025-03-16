
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  Home, 
  Heart, 
  List, 
  Settings, 
  Download, 
  Plus, 
  ExternalLink,
  ArrowLeft,
  Grid3X3 
} from 'lucide-react';

interface NavBarProps {
  onAddVideo?: () => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  currentViewMode?: 'grid' | 'list';
}

export const AppNavBar = ({ 
  onAddVideo, 
  onViewModeChange,
  currentViewMode = 'grid'
}: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showY2MateButton, setShowY2MateButton] = useState(false);

  // Determine if we're on the home route
  const isHome = location.pathname === '/' || location.pathname === '/home';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-around">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            if (isHome) return;
            navigate('/');
          }}
          className={isHome ? "text-primary" : ""}
        >
          {isHome ? (
            <Home className="h-5 w-5" />
          ) : (
            <ArrowLeft className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/favorites')}
          className={location.pathname === '/favorites' ? "text-primary" : ""}
        >
          <Heart className="h-5 w-5" />
        </Button>
        
        {isHome && onViewModeChange && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onViewModeChange(currentViewMode === 'grid' ? 'list' : 'grid')}
          >
            {currentViewMode === 'grid' ? (
              <List className="h-5 w-5" />
            ) : (
              <Grid3X3 className="h-5 w-5" />
            )}
          </Button>
        )}
        
        {onAddVideo && (
          <Button 
            variant="default" 
            size="icon"
            onClick={onAddVideo}
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowY2MateButton(!showY2MateButton)}
        >
          <Download className="h-5 w-5" />
        </Button>

        {showY2MateButton && (
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="absolute bottom-16 right-16 animate-fade-in"
          >
            <a href="https://y2mate.nu/en-isGt/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Y2Mate
            </a>
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/settings')}
          className={location.pathname === '/settings' ? "text-primary" : ""}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
