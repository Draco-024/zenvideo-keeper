
import { Video } from '../types/video';

const STORAGE_KEY = 'bankzen_videos';

export const saveVideos = (videos: Video[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
};

export const getVideos = (): Video[] => {
  const videos = localStorage.getItem(STORAGE_KEY);
  return videos ? JSON.parse(videos) : [];
};

export const getVideoById = (id: string): Video | null => {
  const videos = getVideos();
  return videos.find(video => video.id === id) || null;
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

export const toggleFavorite = (id: string) => {
  const videos = getVideos();
  const index = videos.findIndex((v) => v.id === id);
  if (index !== -1) {
    videos[index].favorite = !videos[index].favorite;
    saveVideos(videos);
    return videos[index];
  }
  return null;
};

export const getFavoriteVideos = (): Video[] => {
  const videos = getVideos();
  return videos.filter(video => video.favorite);
};

export const clearAllVideos = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportVideosToJson = () => {
  const videos = getVideos();
  const dataStr = JSON.stringify(videos, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'bankzen-videos.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importVideosFromJson = (jsonData: string): boolean => {
  try {
    const videos = JSON.parse(jsonData);
    
    if (!Array.isArray(videos)) {
      return false;
    }
    
    // Validate schema
    const isValid = videos.every(video => 
      typeof video.id === 'string' &&
      typeof video.title === 'string' &&
      typeof video.url === 'string' &&
      ['aptitude', 'reasoning', 'english'].includes(video.category)
    );
    
    if (!isValid) {
      return false;
    }
    
    saveVideos(videos);
    return true;
  } catch (error) {
    console.error('Error importing videos:', error);
    return false;
  }
};

export const importSampleVideos = () => {
  // Only import if there are no videos already
  if (getVideos().length === 0) {
    const sampleYoutubeUrls = [
      'https://www.youtube.com/watch?v=cmZ0ejfv5D0',
      'https://www.youtube.com/watch?v=7Q_h7VQH0cQ',
      'https://www.youtube.com/watch?v=twb_fAVMDFI',
      'https://www.youtube.com/watch?v=kG-T7l27cTU',
      'https://www.youtube.com/watch?v=GxwUxGQTJkM',
      'https://www.youtube.com/watch?v=KBysHbNZY90',
      'https://www.youtube.com/watch?v=rn3Nf6VTVPQ',
      'https://www.youtube.com/watch?v=bj9ITl4TPXE'
    ];
    
    const categories: ('aptitude' | 'reasoning' | 'english')[] = ['aptitude', 'reasoning', 'english'];
    
    const titles = [
      'Bank Exam Number Series Tricks',
      'Reasoning Ability for Banking Exams',
      'English Grammar Rules for Bank Exams',
      'Quantitative Aptitude Shortcut Methods',
      'Data Interpretation Strategies',
      'Logical Reasoning Pattern Analysis',
      'Verbal Ability Master Class',
      'Time and Work Problem Solving'
    ];
    
    const descriptions = [
      'Learn advanced techniques for solving number series questions quickly.',
      'Master reasoning ability with these proven methods for banking exams.',
      'Essential grammar rules you need to know for scoring high in English section.',
      'Shortcut methods to solve quantitative aptitude problems in less time.',
      'Step-by-step approach to tackle complex data interpretation questions.',
      'How to identify patterns in logical reasoning questions and solve them efficiently.',
      'Comprehensive guide to excel in verbal ability sections of banking exams.',
      'Quick techniques to solve time and work problems with minimal calculations.'
    ];
    
    const sampleVideos: Video[] = sampleYoutubeUrls.map((url, index) => ({
      id: `sample-${index + 1}`,
      title: titles[index],
      url,
      category: categories[index % 3],
      description: descriptions[index],
      createdAt: Date.now() - (index * 86400000), // Different days
      favorite: index < 2, // First two are favorites
      thumbnail: `https://img.youtube.com/vi/${getYouTubeIdFromUrl(url)}/mqdefault.jpg`
    }));
    
    saveVideos(sampleVideos);
  }
};

function getYouTubeIdFromUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}
