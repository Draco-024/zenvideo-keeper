
import { Video } from '../types/video';

const STORAGE_KEY = 'bankzen_videos';

export const saveVideos = (videos: Video[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
};

export const getVideos = (): Video[] => {
  const videos = localStorage.getItem(STORAGE_KEY);
  return videos ? JSON.parse(videos) : [];
};

export const addVideo = (video: Video) => {
  const videos = getVideos();
  videos.push(video);
  saveVideos(videos);
};

export const deleteVideo = (id: string) => {
  const videos = getVideos();
  const filteredVideos = videos.filter((v) => v.id !== id);
  saveVideos(filteredVideos);
};

export const updateVideo = (updatedVideo: Video) => {
  const videos = getVideos();
  const index = videos.findIndex((v) => v.id === updatedVideo.id);
  if (index !== -1) {
    videos[index] = updatedVideo;
    saveVideos(videos);
  }
};
