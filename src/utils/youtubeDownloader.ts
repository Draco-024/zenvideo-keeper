
import { getYouTubeId } from "./helpers";

interface DownloadFormat {
  url: string;
  mimeType: string;
  quality: string;
  qualityLabel?: string;
  audioQuality?: string;
  bitrate?: number;
  size?: string;
}

interface DownloadResponse {
  status: string;
  id?: string;
  title?: string;
  formats?: DownloadFormat[];
  error?: string;
}

// This key would ideally be stored in a more secure location in a production app
const RAPIDAPI_KEY = "469d65be43mshd338ce4bf882d0ap1b6664jsneb8014d73e4a";

export const downloadYouTubeVideo = async (url: string): Promise<DownloadResponse> => {
  try {
    const videoId = getYouTubeId(url);
    
    if (!videoId) {
      return { 
        status: "error",
        error: "Invalid YouTube URL" 
      };
    }
    
    const response = await fetch(`https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      }
    });
    
    if (!response.ok) {
      return {
        status: "error",
        error: `API Error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    return {
      status: "success",
      id: data.id,
      title: data.title,
      formats: data.formats || []
    };
  } catch (error) {
    console.error("Error downloading YouTube video:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const getPreferredDownloadFormat = (formats: DownloadFormat[] = []): DownloadFormat | null => {
  if (!formats.length) return null;
  
  // Try to find a good quality video (720p) with audio
  const preferredFormat = formats.find(f => 
    f.qualityLabel === "720p" && 
    f.mimeType?.includes("video/mp4") && 
    f.audioQuality
  );
  
  if (preferredFormat) return preferredFormat;
  
  // Fallback to the first mp4 video format
  const mp4Format = formats.find(f => f.mimeType?.includes("video/mp4"));
  if (mp4Format) return mp4Format;
  
  // Last resort: just return the first format
  return formats[0];
};
