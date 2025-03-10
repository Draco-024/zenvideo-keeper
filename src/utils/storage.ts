
import { Video, Playlist, Comment } from '../types/video';

const STORAGE_KEY = 'bankzen_videos';
const PLAYLIST_KEY = 'bankzen_playlists';
const NOTIFICATION_KEY = 'bankzen_notification_shown';

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
  
  // Also remove from playlists
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(playlist => ({
    ...playlist,
    videoIds: playlist.videoIds.filter(videoId => videoId !== id)
  }));
  savePlaylists(updatedPlaylists);
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
  const playlists = getPlaylists();
  const data = { videos, playlists };
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'bankzen-data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importVideosFromJson = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.videos && Array.isArray(data.videos)) {
      const isValid = data.videos.every((video: any) => 
        typeof video.id === 'string' &&
        typeof video.title === 'string' &&
        typeof video.url === 'string' &&
        ['aptitude', 'reasoning', 'english'].includes(video.category)
      );
      
      if (!isValid) {
        return false;
      }
      
      saveVideos(data.videos);
      
      // Import playlists if available
      if (data.playlists && Array.isArray(data.playlists)) {
        savePlaylists(data.playlists);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const isFirstTimeNotification = (): boolean => {
  return localStorage.getItem(NOTIFICATION_KEY) !== 'true';
};

export const markNotificationShown = () => {
  localStorage.setItem(NOTIFICATION_KEY, 'true');
};

export const addCommentToVideo = (videoId: string, comment: Comment) => {
  const video = getVideoById(videoId);
  if (video) {
    const updatedVideo = { 
      ...video, 
      comments: [...(video.comments || []), comment]
    };
    updateVideo(updatedVideo);
    return updatedVideo;
  }
  return null;
};

// Playlist functions
export const savePlaylists = (playlists: Playlist[]) => {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists));
};

export const getPlaylists = (): Playlist[] => {
  const playlists = localStorage.getItem(PLAYLIST_KEY);
  return playlists ? JSON.parse(playlists) : [];
};

export const getPlaylistById = (id: string): Playlist | null => {
  const playlists = getPlaylists();
  return playlists.find(playlist => playlist.id === id) || null;
};

export const createPlaylist = (playlist: Playlist) => {
  const playlists = getPlaylists();
  playlists.push(playlist);
  savePlaylists(playlists);
  return playlist;
};

export const updatePlaylist = (updatedPlaylist: Playlist) => {
  const playlists = getPlaylists();
  const index = playlists.findIndex((p) => p.id === updatedPlaylist.id);
  if (index !== -1) {
    playlists[index] = updatedPlaylist;
    savePlaylists(playlists);
    return updatedPlaylist;
  }
  return null;
};

export const deletePlaylist = (id: string) => {
  const playlists = getPlaylists();
  const filteredPlaylists = playlists.filter((p) => p.id !== id);
  savePlaylists(filteredPlaylists);
};

export const addVideoToPlaylist = (playlistId: string, videoId: string) => {
  const playlist = getPlaylistById(playlistId);
  if (playlist && !playlist.videoIds.includes(videoId)) {
    const updatedPlaylist = { 
      ...playlist, 
      videoIds: [...playlist.videoIds, videoId]
    };
    updatePlaylist(updatedPlaylist);
    return updatedPlaylist;
  }
  return null;
};

export const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
  const playlist = getPlaylistById(playlistId);
  if (playlist) {
    const updatedPlaylist = { 
      ...playlist, 
      videoIds: playlist.videoIds.filter(id => id !== videoId)
    };
    updatePlaylist(updatedPlaylist);
    return updatedPlaylist;
  }
  return null;
};

export const getVideosInPlaylist = (playlistId: string): Video[] => {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return [];
  
  const allVideos = getVideos();
  return allVideos.filter(video => playlist.videoIds.includes(video.id));
};

function getYouTubeIdFromUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

export const isGooglePhotosUrl = (url: string): boolean => {
  return url.includes('photos.app.goo.gl') || url.includes('photos.google.com');
};

export const getVideoType = (url: string): 'youtube' | 'googlephotos' => {
  return isGooglePhotosUrl(url) ? 'googlephotos' : 'youtube';
};

export const getThumbnailUrl = (video: Pick<Video, 'url' | 'videoType'>): string => {
  if (video.videoType === 'googlephotos') {
    return '/placeholder.svg'; // Use a placeholder for Google Photos
  }
  const youtubeId = getYouTubeIdFromUrl(video.url);
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
};

export const importSampleVideos = () => {
  // Only import if there are no videos already
  if (getVideos().length === 0) {
    const allYoutubeUrls = [
      'https://www.youtube.com/watch?v=cmZ0ejfv5D0',
      'https://www.youtube.com/watch?v=7Q_h7VQH0cQ',
      'https://www.youtube.com/watch?v=twb_fAVMDFI',
      'https://www.youtube.com/watch?v=kG-T7l27cTU',
      'https://www.youtube.com/watch?v=GxwUxGQTJkM',
      'https://www.youtube.com/watch?v=KBysHbNZY90',
      'https://www.youtube.com/watch?v=rn3Nf6VTVPQ',
      'https://www.youtube.com/watch?v=bj9ITl4TPXE',
      'https://www.youtube.com/watch?v=Z9CWHZfSHyI',
      'https://www.youtube.com/watch?v=9_J3NfESEbs',
      'https://www.youtube.com/watch?v=Q6d0PaPB8ww',
      'https://www.youtube.com/watch?v=rOjb8QvuQ2s',
      'https://www.youtube.com/watch?v=okVMuUua5AE',
      'https://www.youtube.com/watch?v=ya5V4g5XYb4',
      'https://www.youtube.com/watch?v=tgc4zxv92co',
      'https://www.youtube.com/watch?v=2BkrbyQ8ZrE',
      'https://www.youtube.com/watch?v=5iRmnDgsTiw',
      'https://www.youtube.com/watch?v=7mXAevSFNrc',
      'https://www.youtube.com/watch?v=SKf_7AMI2_Y',
      'https://www.youtube.com/watch?v=mxv0VVbzqho',
      'https://www.youtube.com/watch?v=Gla5fRkvX9M',
      // adding more videos from the list
      'https://www.youtube.com/watch?v=RDkbV2RqBcQ',
      'https://www.youtube.com/watch?v=tazaZUG8nfI',
      'https://www.youtube.com/watch?v=fkqSDviOnXU'
    ];
    
    // Add Google Photos URL
    const googlePhotosUrl = 'https://photos.app.goo.gl/PXSHYAWUYip4Uwfi9';
    
    const categories: ('aptitude' | 'reasoning' | 'english')[] = ['aptitude', 'reasoning', 'english'];
    
    const titles = [
      'Bank Exam Number Series Tricks',
      'Reasoning Ability for Banking Exams',
      'English Grammar Rules for Bank Exams',
      'Quantitative Aptitude Shortcut Methods',
      'Data Interpretation Strategies',
      'Logical Reasoning Pattern Analysis',
      'Verbal Ability Master Class',
      'Time and Work Problem Solving',
      'Banking Awareness Key Topics',
      'Computer Knowledge for Banking Exams',
      'General Knowledge Quick Review',
      'Current Affairs for Bank Exams',
      'Percentage Problems Shortcuts',
      'Ratio and Proportion Techniques',
      'Profit and Loss Easy Methods',
      'Simple and Compound Interest',
      'Coding-Decoding Strategies',
      'Blood Relations Reasoning',
      'Syllogism Tricks and Tips',
      'Statement and Assumption',
      'Grammar Rules for Bank Exams',
      'Reading Comprehension Strategies',
      'Vocabulary Builder for Banking',
      'Error Spotting in Sentences'
    ];
    
    const descriptions = [
      'Learn advanced techniques for solving number series questions quickly.',
      'Master reasoning ability with these proven methods for banking exams.',
      'Essential grammar rules you need to know for scoring high in English section.',
      'Shortcut methods to solve quantitative aptitude problems in less time.',
      'Step-by-step approach to tackle complex data interpretation questions.',
      'How to identify patterns in logical reasoning questions and solve them efficiently.',
      'Comprehensive guide to excel in verbal ability sections of banking exams.',
      'Quick techniques to solve time and work problems with minimal calculations.',
      'Important banking awareness topics you must know for all banking exams.',
      'Essential computer knowledge concepts tested in banking exams.',
      'Quick review of important general knowledge topics for banking exams.',
      'Latest current affairs that are important for upcoming banking exams.',
      'Master percentage problems with these quick calculation techniques.',
      'Easy methods to solve ratio and proportion questions in banking exams.',
      'Profit and loss concepts explained with shortcuts for quick calculations.',
      'Simple and compound interest problems solved with practical examples.',
      'Strategies to decode complex coding-decoding problems in reasoning section.',
      'Techniques to solve complicated blood relation problems in reasoning.',
      'Master syllogism with these simple tricks and solve any question.',
      'How to analyze statement and assumption questions efficiently.',
      'Important grammar rules you must know for banking exam English section.',
      'Strategies to tackle reading comprehension passages effectively.',
      'Build your vocabulary specifically for banking and financial terms.',
      'How to spot errors in sentences quickly in the English section.'
    ];
    
    // Create sample videos array
    const sampleVideos: Video[] = allYoutubeUrls.map((url, index) => ({
      id: `sample-${index + 1}`,
      title: titles[index] || `Banking Video ${index + 1}`,
      url,
      category: categories[index % 3],
      description: descriptions[index] || 'Video for banking exam preparation.',
      createdAt: Date.now() - (index * 86400000), // Different days
      favorite: index < 5, // First five are favorites
      thumbnail: `https://img.youtube.com/vi/${getYouTubeIdFromUrl(url)}/mqdefault.jpg`,
      videoType: 'youtube',
      comments: [],
      playlists: []
    }));
    
    // Add Google Photos collection
    sampleVideos.push({
      id: 'google-photos-1',
      title: 'Banking Concepts Photo Collection',
      url: googlePhotosUrl,
      category: 'aptitude',
      description: 'A collection of banking concept images and explanations.',
      createdAt: Date.now(),
      favorite: true,
      videoType: 'googlephotos',
      comments: [],
      playlists: []
    });
    
    saveVideos(sampleVideos);
    
    // Create a few sample playlists
    const samplePlaylists: Playlist[] = [
      {
        id: 'playlist-1',
        name: 'Aptitude Essentials',
        description: 'Key videos for mastering aptitude',
        videoIds: sampleVideos
          .filter(v => v.category === 'aptitude')
          .slice(0, 5)
          .map(v => v.id),
        createdAt: Date.now()
      },
      {
        id: 'playlist-2',
        name: 'English Fundamentals',
        description: 'Must-watch videos for English section',
        videoIds: sampleVideos
          .filter(v => v.category === 'english')
          .slice(0, 5)
          .map(v => v.id),
        createdAt: Date.now() - 86400000
      }
    ];
    
    savePlaylists(samplePlaylists);
  }
};
