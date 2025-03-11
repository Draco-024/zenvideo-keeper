
import { Video } from '@/types/video';

interface VideoPlayerProps {
  video: Video;
}

export const VideoPlayer = ({ video }: VideoPlayerProps) => {
  const getEmbedUrl = () => {
    if (video.videoType === 'googlephotos') {
      // For Google Photos, we'll return the direct URL
      return video.url;
    } else {
      // For YouTube
      const youtubeId = getYouTubeId(video.url);
      return `https://www.youtube.com/embed/${youtubeId}`;
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-black mb-4 sm:mb-6">
      <div className="aspect-video">
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
        ) : (
          <iframe
            src={getEmbedUrl()}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

function getYouTubeId(url: string) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : '';
}
