
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));
  
  function handleChange() {
    setMatches(getMatches(query));
  }
  
  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    
    // Initial check
    handleChange();
    
    // Listen for changes
    matchMedia.addEventListener('change', handleChange);
    
    // Clean up
    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function usePreferredLayout(): 'horizontal' | 'vertical' {
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  
  // On mobile portrait, use vertical layout
  if (isMobile && isPortrait) {
    return 'vertical';
  }
  
  // Default to horizontal
  return 'horizontal';
}
