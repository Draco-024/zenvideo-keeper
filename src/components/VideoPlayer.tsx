
import { Video } from '@/types/video';
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  video: Video;
}

export const VideoPlayer = ({ video }: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Reset states when video changes
    setHasError(false);
    setIsLoading(true);
  }, [video.id, video.url]);
  
  const getEmbedUrl = () => {
    if (video.videoType === 'googlephotos') {
      // For Google Photos, we'll return the direct URL
      return video.url;
    } else {
      // For YouTube
      const youtubeId = getYouTubeId(video.url);
      // Use the embed API with additional parameters for better compatibility
      return `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.origin}&rel=0`;
    }
  };

  const handleError = () => {
    console.log('Video loading error:', video.url);
    setHasError(true);
    setIsLoading(false);
  };
  
  const handleLoad = () => {
    console.log('Video loaded successfully:', video.url);
    setIsLoading(false);
  };

  // Add a timeout to detect videos that never load properly
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Video loading timed out:', video.url);
        setHasError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, video.url]);

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-black mb-4 sm:mb-6">
      <div className="aspect-video relative">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        )}
        
        {video.videoType === 'googlephotos' ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-4"
            >
              <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M8 2v20" />
                  <path d="M16 2v20" />
                  <path d="M2 8h20" />
                  <path d="M2 16h20" />
                </svg>
              </div>
              <span className="text-lg font-medium">Open Google Photos Collection</span>
              <span className="text-sm text-gray-400">Click to view in Google Photos</span>
            </a>
          </div>
        ) : hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <span className="text-lg font-medium">Video Unavailable</span>
              <span className="text-sm text-gray-400 text-center max-w-xs px-4">This video may have been removed or is currently unavailable. Try refreshing or viewing on YouTube directly.</span>
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 bg-primary/80 hover:bg-primary px-4 py-2 rounded-full text-white text-sm"
              >
                Try watching on YouTube
              </a>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={getEmbedUrl()}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
            onError={handleError}
            onLoad={handleLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>
    </div>
  );
};

// Helper function to extract YouTube ID
function getYouTubeId(url: string) {
  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}
