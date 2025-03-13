
import { getYouTubeId } from "./helpers";

interface AlternateDownloadFormat {
  quality: string;
  url: string;
  mimeType?: string;
  resolution?: string;
  size?: string;
  type?: 'video' | 'audio';
}

interface AlternateDownloadResponse {
  status: string;
  title?: string;
  formats?: AlternateDownloadFormat[];
  error?: string;
}

// Using a different YouTube download API
const ALTERNATE_API_KEY = "469d65be43mshd338ce4bf882d0ap1b6664jsneb8014d73e4a";

export const downloadYouTubeVideoAlternate = async (url: string): Promise<AlternateDownloadResponse> => {
  try {
    const videoId = getYouTubeId(url);
    
    if (!videoId) {
      return { 
        status: "error",
        error: "Invalid YouTube URL" 
      };
    }
    
    // Use the Rapid API Y2mate API as an alternative
    const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
        'x-rapidapi-key': ALTERNATE_API_KEY,
      }
    });
    
    if (!response.ok) {
      // Try using a fallback API if first one fails
      return await tryFallbackAPI(videoId);
    }
    
    const data = await response.json();
    
    // Transform the response to match our format
    if (data.link) {
      return {
        status: "success",
        title: data.title,
        formats: [
          {
            quality: "Audio MP3",
            url: data.link,
            mimeType: "audio/mp3",
            size: data.size || "Unknown size",
            type: 'audio'
          }
        ]
      };
    } else {
      // Try using a fallback API if first one fails
      return await tryFallbackAPI(videoId);
    }
  } catch (error) {
    console.error("Error downloading YouTube video with alternate API:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

async function tryFallbackAPI(videoId: string): Promise<AlternateDownloadResponse> {
  try {
    // Try a fallback API (YouTube Search and Download API)
    const fallbackResponse = await fetch(`https://youtube-search-and-download.p.rapidapi.com/video/info?id=${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube-search-and-download.p.rapidapi.com',
        'x-rapidapi-key': ALTERNATE_API_KEY,
      }
    });
    
    if (!fallbackResponse.ok) {
      return {
        status: "error",
        error: `Fallback API Error: ${fallbackResponse.status} ${fallbackResponse.statusText}`
      };
    }
    
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.streamingData && fallbackData.streamingData.formats) {
      const formats = [
        ...fallbackData.streamingData.formats.map((format: any) => ({
          quality: `${format.qualityLabel || 'Standard'} - Video`,
          url: format.url,
          mimeType: format.mimeType,
          resolution: format.qualityLabel,
          size: `${Math.round(format.contentLength / 1024 / 1024)} MB`,
          type: 'video' as const
        })),
        ...fallbackData.streamingData.adaptiveFormats
          .filter((format: any) => format.mimeType.includes('audio'))
          .map((format: any) => ({
            quality: `${format.audioQuality || 'Standard'} - Audio`,
            url: format.url,
            mimeType: format.mimeType,
            size: `${Math.round(format.contentLength / 1024 / 1024)} MB`,
            type: 'audio' as const
          }))
      ];
      
      return {
        status: "success",
        title: fallbackData.videoDetails?.title,
        formats
      };
    }
    
    return {
      status: "error",
      error: "No downloadable formats found"
    };
  } catch (error) {
    console.error("Error with fallback API:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown fallback error"
    };
  }
}

export const getAlternatePreferredFormat = (formats: AlternateDownloadFormat[] = [], type: 'video' | 'audio' = 'video'): AlternateDownloadFormat | null => {
  if (!formats.length) return null;
  
  // First try to find a format of the requested type
  const typeFormats = formats.filter(format => format.type === type);
  if (typeFormats.length) {
    // For video, get the one with the highest resolution that's not too high
    if (type === 'video') {
      // Sort by resolution - assume resolution is in format like "720p"
      const sortedFormats = [...typeFormats].sort((a, b) => {
        const resA = parseInt((a.resolution || '0p').replace('p', ''));
        const resB = parseInt((b.resolution || '0p').replace('p', ''));
        return resB - resA; // higher resolution first
      });
      
      // First try to find one that's 720p or below for better compatibility
      const preferredFormat = sortedFormats.find(f => {
        const res = parseInt((f.resolution || '0p').replace('p', ''));
        return res <= 720 && res > 0;
      });
      
      return preferredFormat || sortedFormats[0];
    }
    
    // For audio, just return the first one
    return typeFormats[0];
  }
  
  // If no formats of the requested type, return any format
  return formats[0];
};
