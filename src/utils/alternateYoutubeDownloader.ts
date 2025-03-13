
import { getYouTubeId } from "./helpers";

interface AlternateDownloadFormat {
  quality: string;
  url: string;
  mimeType?: string;
  resolution?: string;
  size?: string;
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
      return {
        status: "error",
        error: `API Error: ${response.status} ${response.statusText}`
      };
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
            size: data.size || "Unknown size"
          }
        ]
      };
    } else {
      return {
        status: "error",
        error: data.msg || "No download link available"
      };
    }
  } catch (error) {
    console.error("Error downloading YouTube video with alternate API:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const getAlternatePreferredFormat = (formats: AlternateDownloadFormat[] = []): AlternateDownloadFormat | null => {
  if (!formats.length) return null;
  return formats[0]; // Return the first format since this API typically returns just one
};
