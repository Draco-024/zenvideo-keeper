
import { getYouTubeId } from './helpers';

/**
 * Validates if a YouTube URL exists and has accessible content
 * @param url The YouTube URL to validate
 * @returns Promise resolving to true if the video exists, false otherwise
 */
export const validateYouTubeUrl = async (url: string): Promise<boolean> => {
  const videoId = getYouTubeId(url);
  
  if (!videoId) {
    return false;
  }
  
  try {
    // Try to fetch the thumbnail - if it returns a 404, the video likely doesn't exist
    const response = await fetch(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error validating YouTube URL:', error);
    return false;
  }
};

/**
 * Checks if a YouTube video ID is from a deleted or unavailable video
 * This checks by seeing if the thumbnail is the standard "unavailable" image
 */
export const isDeletedYouTubeVideo = async (videoId: string): Promise<boolean> => {
  try {
    // We'd need to fetch the image and check if it's the standard unavailable image
    // This is a simplified approach - a real implementation would check the image hash
    const response = await fetch(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
    if (!response.ok) return true;
    
    // Checking image dimensions can sometimes indicate if it's the default unavailable image
    // Most unavailable thumbnails have a specific size
    const blob = await response.blob();
    return blob.size < 1000; // Very small images are likely placeholder/unavailable images
  } catch (error) {
    console.error('Error checking if YouTube video is deleted:', error);
    return true;
  }
};
