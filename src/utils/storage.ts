
import { Video, Category, Playlist } from '@/types/video';

const VIDEO_STORAGE_KEY = 'bankzen_videos';
const PLAYLIST_STORAGE_KEY = 'bankzen_playlists';

// Utility functions
const loadFromLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Video management functions
export const getVideos = (): Video[] => {
  const storedVideos = loadFromLocalStorage(VIDEO_STORAGE_KEY);
  return storedVideos ? JSON.parse(storedVideos) : [];
};

export const getVideoById = (id: string): Video | undefined => {
  const videos = getVideos();
  return videos.find(video => video.id === id);
};

export const addVideo = (video: Video): void => {
  const videos = getVideos();
  videos.push(video);
  saveToLocalStorage(VIDEO_STORAGE_KEY, videos);
};

export const updateVideo = (updatedVideo: Video): void => {
  const videos = getVideos();
  const updatedVideos = videos.map(video =>
    video.id === updatedVideo.id ? updatedVideo : video
  );
  saveToLocalStorage(VIDEO_STORAGE_KEY, updatedVideos);
};

export const deleteVideo = (id: string): void => {
  const videos = getVideos();
  const updatedVideos = videos.filter(video => video.id !== id);
  saveToLocalStorage(VIDEO_STORAGE_KEY, updatedVideos);
};

export const clearAllVideos = (): void => {
  localStorage.removeItem(VIDEO_STORAGE_KEY);
  // Also clear playlists as they may contain references to these videos
  localStorage.removeItem(PLAYLIST_STORAGE_KEY);
};

export const addCommentToVideo = (videoId: string, comment: any): Video | null => {
  const video = getVideoById(videoId);
  if (video) {
    const updatedVideo = {
      ...video, 
      comments: [...(video.comments || []), {...comment, id: Date.now().toString(), createdAt: Date.now()}]
    };
    updateVideo(updatedVideo);
    return updatedVideo;
  }
  return null;
};

// Video type detection
export const isGooglePhotosUrl = (url: string): boolean => {
  return url.includes('photos.google.com') || url.includes('photos.app.goo.gl');
};

export const getVideoType = (url: string): 'youtube' | 'googlephotos' => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (isGooglePhotosUrl(url)) {
    return 'googlephotos';
  } else {
    // Default to YouTube for other URLs
    return 'youtube';
  }
};

// Playlist management functions
export const getPlaylists = (): Playlist[] => {
  const storedPlaylists = loadFromLocalStorage(PLAYLIST_STORAGE_KEY);
  return storedPlaylists ? JSON.parse(storedPlaylists) : [];
};

export const getPlaylistById = (id: string): Playlist | undefined => {
  const playlists = getPlaylists();
  return playlists.find(playlist => playlist.id === id);
};

export const addPlaylist = (playlist: Playlist): void => {
  const playlists = getPlaylists();
  playlists.push(playlist);
  saveToLocalStorage(PLAYLIST_STORAGE_KEY, playlists);
};

export const createPlaylist = (name: string, description: string = ""): Playlist => {
  const newPlaylist: Playlist = {
    id: Date.now().toString(),
    name,
    description,
    videoIds: [],
    createdAt: Date.now()
  };
  addPlaylist(newPlaylist);
  return newPlaylist;
};

export const updatePlaylist = (updatedPlaylist: Playlist): void => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(playlist =>
    playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
  );
  saveToLocalStorage(PLAYLIST_STORAGE_KEY, updatedPlaylists);
};

export const deletePlaylist = (id: string): void => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
  saveToLocalStorage(PLAYLIST_STORAGE_KEY, updatedPlaylists);
};

export const addVideoToPlaylist = (playlistId: string, videoId: string): void => {
  const playlist = getPlaylistById(playlistId);
  if (playlist && !playlist.videoIds.includes(videoId)) {
    const updatedPlaylist = {
      ...playlist,
      videoIds: [...playlist.videoIds, videoId]
    };
    updatePlaylist(updatedPlaylist);
  }
};

export const removeVideoFromPlaylist = (playlistId: string, videoId: string): void => {
  const playlist = getPlaylistById(playlistId);
  if (playlist) {
    const updatedPlaylist = {
      ...playlist,
      videoIds: playlist.videoIds.filter(id => id !== videoId)
    };
    updatePlaylist(updatedPlaylist);
  }
};

export const getVideosInPlaylist = (playlistId: string): Video[] => {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return [];
  
  const allVideos = getVideos();
  return playlist.videoIds
    .map(videoId => allVideos.find(video => video.id === videoId))
    .filter((video): video is Video => video !== undefined);
};

// Storage functions for importing/exporting
export const exportVideosToJson = (): void => {
  const videos = getVideos();
  const dataStr = JSON.stringify(videos);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileName = 'bankzen_videos.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
};

export const importVideosFromJson = (jsonString: string): boolean => {
  try {
    const videos = JSON.parse(jsonString);
    if (!Array.isArray(videos)) {
      console.error("Invalid data format: JSON data is not an array.");
      return false;
    }

    // Basic validation to ensure the data looks like Video objects
    const isValid = videos.every(video => typeof video === 'object' && video !== null && 'id' in video && 'title' in video && 'url' in video && 'category' in video);
    if (!isValid) {
      console.error("Invalid data format: JSON data does not match the expected Video object structure.");
      return false;
    }

    saveToLocalStorage(VIDEO_STORAGE_KEY, videos);
    return true;
  } catch (error) {
    console.error("Error importing videos from JSON:", error);
    return false;
  }
};

export const isFirstTimeNotification = (): boolean => {
  return localStorage.getItem('firstTimeNotificationShown') !== 'true';
};

export const markNotificationShown = (): void => {
  localStorage.setItem('firstTimeNotificationShown', 'true');
};

export const importSampleVideos = () => {
  // Check if videos already exist
  if (getVideos().length > 0) return;

  const sampleVideos: Video[] = [
    {
      id: '1',
      title: 'Simplification Tricks',
      url: 'https://www.youtube.com/watch?v=r3VNfgkJ4ec',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/r3VNfgkJ4ec/mqdefault.jpg',
      description: 'Learn simplification tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 10000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '2',
      title: 'Percentage Tricks',
      url: 'https://www.youtube.com/watch?v=jJ0nTK4jKIQ',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/jJ0nTK4jKIQ/mqdefault.jpg',
      description: 'Learn percentage tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 9000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '3',
      title: 'Ratio and Proportion Tricks',
      url: 'https://www.youtube.com/watch?v=46RYjdg9jqc',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/46RYjdg9jqc/mqdefault.jpg',
      description: 'Learn ratio and proportion tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 8000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '4',
      title: 'Profit and Loss Tricks',
      url: 'https://www.youtube.com/watch?v=55QNQtazATA',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/55QNQtazATA/mqdefault.jpg',
      description: 'Learn profit and loss tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 7000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '5',
      title: 'Time and Work Tricks',
      url: 'https://www.youtube.com/watch?v=a9KqgGGb9oQ',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/a9KqgGGb9oQ/mqdefault.jpg',
      description: 'Learn time and work tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 6000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '6',
      title: 'Time and Distance Tricks',
      url: 'https://www.youtube.com/watch?v=JMaphy-mwsM',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/JMaphy-mwsM/mqdefault.jpg',
      description: 'Learn time and distance tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 5000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '7',
      title: 'Simple Interest Tricks',
      url: 'https://www.youtube.com/watch?v=VrVixRbaQ9I',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/VrVixRbaQ9I/mqdefault.jpg',
      description: 'Learn simple interest tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 4000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '8',
      title: 'Compound Interest Tricks',
      url: 'https://www.youtube.com/watch?v=cW-jezSpIXs',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/cW-jezSpIXs/mqdefault.jpg',
      description: 'Learn compound interest tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 3000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '9',
      title: 'Problems on Ages Tricks',
      url: 'https://www.youtube.com/watch?v=czvZA0xmgPA',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/czvZA0xmgPA/mqdefault.jpg',
      description: 'Learn problems on ages tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 2000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: '10',
      title: 'Mixtures and Alligations Tricks',
      url: 'https://www.youtube.com/watch?v=mEaK8e_W-YQ',
      category: 'aptitude',
      thumbnail: 'https://img.youtube.com/vi/mEaK8e_W-YQ/mqdefault.jpg',
      description: 'Learn mixtures and alligations tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 1000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r1',
      title: 'Coding Decoding Tricks',
      url: 'https://www.youtube.com/watch?v=qjJjwmjG4lQ',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/qjJjwmjG4lQ/mqdefault.jpg',
      description: 'Learn coding decoding tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 10000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r2',
      title: 'Blood Relations Tricks',
      url: 'https://www.youtube.com/watch?v=PMjKPbwGjOU',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/PMjKPbwGjOU/mqdefault.jpg',
      description: 'Learn blood relations tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 9000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r3',
      title: 'Direction Sense Tricks',
      url: 'https://www.youtube.com/watch?v=5wME0EqC4nk',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/5wME0EqC4nk/mqdefault.jpg',
      description: 'Learn direction sense tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 8000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r4',
      title: 'Inequality Tricks',
      url: 'https://www.youtube.com/watch?v=Y_oRRGjhJsc',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/Y_oRRGjhJsc/mqdefault.jpg',
      description: 'Learn inequality tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 7000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r5',
      title: 'Syllogism Tricks',
      url: 'https://www.youtube.com/watch?v=9tRyqV-jkqc',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/9tRyqV-jkqc/mqdefault.jpg',
      description: 'Learn syllogism tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 6000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r6',
      title: 'Seating Arrangement Tricks',
      url: 'https://www.youtube.com/watch?v=eJjOCx4vKzA',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/eJjOCx4vKzA/mqdefault.jpg',
      description: 'Learn seating arrangement tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 5000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r7',
      title: 'Puzzle Tricks',
      url: 'https://www.youtube.com/watch?v=Hw8FZfqjCSI',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/Hw8FZfqjCSI/mqdefault.jpg',
      description: 'Learn puzzle tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 4000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r8',
      title: 'Data Sufficiency Tricks',
      url: 'https://www.youtube.com/watch?v=n3Dxj-rPPGY',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/n3Dxj-rPPGY/mqdefault.jpg',
      description: 'Learn data sufficiency tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 3000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r9',
      title: 'Input Output Tricks',
      url: 'https://www.youtube.com/watch?v=oR9t9eR-jVE',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/oR9t9eR-jVE/mqdefault.jpg',
      description: 'Learn input output tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 2000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'r10',
      title: 'Logical Reasoning Tricks',
      url: 'https://www.youtube.com/watch?v=wtG93nKihXs',
      category: 'reasoning',
      thumbnail: 'https://img.youtube.com/vi/wtG93nKihXs/mqdefault.jpg',
      description: 'Learn logical reasoning tricks for bank exams',
      favorite: false,
      createdAt: Date.now() - 1000000,
      videoType: 'youtube',
      comments: []
    },
    // English videos - Update with the new ones
    {
      id: 'en1',
      title: 'Most important vocabulary, phrases for Bank exams',
      url: 'https://www.youtube.com/watch?v=PqaPr0dAwyo',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/PqaPr0dAwyo/mqdefault.jpg',
      description: 'Important vocabulary and phrases for bank exams',
      favorite: false,
      createdAt: Date.now() - 10000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en2',
      title: 'English Grammar Rules: Parts of Speech',
      url: 'https://www.youtube.com/watch?v=9HogWXy5y90',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/9HogWXy5y90/mqdefault.jpg',
      description: 'Learn about the different parts of speech in English grammar',
      favorite: false,
      createdAt: Date.now() - 9900000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en3',
      title: 'Tense in English Grammar with Examples',
      url: 'https://www.youtube.com/watch?v=C9KFy5czsWY',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/C9KFy5czsWY/mqdefault.jpg',
      description: 'Understanding tenses with examples',
      favorite: false,
      createdAt: Date.now() - 9800000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en4',
      title: 'Common Errors in English Grammar',
      url: 'https://www.youtube.com/watch?v=7E_FRY_8Vvc',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/7E_FRY_8Vvc/mqdefault.jpg',
      description: 'Avoid these common errors in English grammar',
      favorite: false,
      createdAt: Date.now() - 9700000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en5',
      title: 'Prepositions in English Grammar',
      url: 'https://www.youtube.com/watch?v=kO2Haju7k9U',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/kO2Haju7k9U/mqdefault.jpg',
      description: 'Learn about prepositions in English grammar',
      favorite: false,
      createdAt: Date.now() - 9600000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en6',
      title: 'Articles in English Grammar',
      url: 'https://www.youtube.com/watch?v=11RUUZBbG_8',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/11RUUZBbG_8/mqdefault.jpg',
      description: 'Learn about articles in English grammar',
      favorite: false,
      createdAt: Date.now() - 9500000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en7',
      title: 'Active and Passive Voice in English',
      url: 'https://www.youtube.com/watch?v=b36YRTv4684',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/b36YRTv4684/mqdefault.jpg',
      description: 'Understanding active and passive voice in English',
      favorite: false,
      createdAt: Date.now() - 9400000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en8',
      title: 'Direct and Indirect Speech Rules',
      url: 'https://www.youtube.com/watch?v=Dy8B-2Bcx7U',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/Dy8B-2Bcx7U/mqdefault.jpg',
      description: 'Rules for converting direct to indirect speech',
      favorite: false,
      createdAt: Date.now() - 9300000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en9',
      title: 'Spotting Errors in English Grammar',
      url: 'https://www.youtube.com/watch?v=IGd4Robx0O0',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/IGd4Robx0O0/mqdefault.jpg',
      description: 'How to spot errors in English sentences',
      favorite: false,
      createdAt: Date.now() - 9200000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en10',
      title: 'Sentence Improvement in English',
      url: 'https://www.youtube.com/watch?v=7Itqz0egSgg',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/7Itqz0egSgg/mqdefault.jpg',
      description: 'How to improve sentences in English',
      favorite: false,
      createdAt: Date.now() - 9100000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en11',
      title: 'Synonyms and Antonyms for Bank Exams',
      url: 'https://www.youtube.com/watch?v=cPYl9IMwV4s',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/cPYl9IMwV4s/mqdefault.jpg',
      description: 'Important synonyms and antonyms for bank exams',
      favorite: false,
      createdAt: Date.now() - 9000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en12',
      title: 'Reading Comprehension Strategies',
      url: 'https://www.youtube.com/watch?v=TduqEEgBRHk',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/TduqEEgBRHk/mqdefault.jpg',
      description: 'Strategies for reading comprehension passages',
      favorite: false,
      createdAt: Date.now() - 8900000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en13',
      title: 'Idioms and Phrases for Bank Exams',
      url: 'https://www.youtube.com/watch?v=fggZusWOFhk',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/fggZusWOFhk/mqdefault.jpg',
      description: 'Important idioms and phrases for bank exams',
      favorite: false,
      createdAt: Date.now() - 8800000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en14',
      title: 'One Word Substitution in English',
      url: 'https://www.youtube.com/watch?v=icgwNTcrPyA',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/icgwNTcrPyA/mqdefault.jpg',
      description: 'Important one word substitutions for bank exams',
      favorite: false,
      createdAt: Date.now() - 8700000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en15',
      title: 'Para Jumbles Solving Techniques',
      url: 'https://www.youtube.com/watch?v=IYBy3wQd5M4',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/IYBy3wQd5M4/mqdefault.jpg',
      description: 'Techniques to solve paragraph jumbles',
      favorite: false,
      createdAt: Date.now() - 8600000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en16',
      title: 'Cloze Test Strategies for Bank Exams',
      url: 'https://www.youtube.com/watch?v=YNbL4kebekM',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/YNbL4kebekM/mqdefault.jpg',
      description: 'How to solve cloze test questions',
      favorite: false,
      createdAt: Date.now() - 8500000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en17',
      title: 'Fill in the Blanks - English Grammar',
      url: 'https://www.youtube.com/watch?v=vGxWpd1OfoA',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/vGxWpd1OfoA/mqdefault.jpg',
      description: 'How to solve fill in the blanks questions',
      favorite: false,
      createdAt: Date.now() - 8400000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en18',
      title: 'Error Spotting Rules in English',
      url: 'https://www.youtube.com/watch?v=pMCdTONcIDI',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/pMCdTONcIDI/mqdefault.jpg',
      description: 'Rules for spotting errors in English sentences',
      favorite: false,
      createdAt: Date.now() - 8300000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en19',
      title: 'Sentence Correction Techniques',
      url: 'https://www.youtube.com/watch?v=xWLZ2l0UA2s',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/xWLZ2l0UA2s/mqdefault.jpg',
      description: 'Techniques for correcting sentences in English',
      favorite: false,
      createdAt: Date.now() - 8200000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en20',
      title: 'Grammar Rules for Banking Exams',
      url: 'https://www.youtube.com/watch?v=7acbD2qHN4Y',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/7acbD2qHN4Y/mqdefault.jpg',
      description: 'Important grammar rules for banking exams',
      favorite: false,
      createdAt: Date.now() - 8100000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en21',
      title: 'Advanced Vocabulary for Banking',
      url: 'https://www.youtube.com/watch?v=MwuV10B-y8E',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/MwuV10B-y8E/mqdefault.jpg',
      description: 'Advanced vocabulary words for banking exams',
      favorite: false,
      createdAt: Date.now() - 8000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en22',
      title: 'Subject-Verb Agreement Rules',
      url: 'https://www.youtube.com/watch?v=9hrgZBSNWQk',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/9hrgZBSNWQk/mqdefault.jpg',
      description: 'Rules of subject-verb agreement in English',
      favorite: false,
      createdAt: Date.now() - 7900000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en23',
      title: 'Common Nouns and Proper Nouns',
      url: 'https://www.youtube.com/watch?v=8ea8ezvtGRY',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/8ea8ezvtGRY/mqdefault.jpg',
      description: 'Understanding common and proper nouns in English',
      favorite: false,
      createdAt: Date.now() - 7800000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en24',
      title: 'Modals in English Grammar',
      url: 'https://www.youtube.com/watch?v=k7HIXb5EryM',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/k7HIXb5EryM/mqdefault.jpg',
      description: 'Understanding modal verbs in English',
      favorite: false,
      createdAt: Date.now() - 7700000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en25',
      title: 'Adjectives and Adverbs in English',
      url: 'https://www.youtube.com/watch?v=His7C-X-eOU',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/His7C-X-eOU/mqdefault.jpg',
      description: 'Understanding adjectives and adverbs in English',
      favorite: false,
      createdAt: Date.now() - 7600000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en26',
      title: 'Conditional Sentences in English',
      url: 'https://www.youtube.com/watch?v=7Gg21I3MNvY',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/7Gg21I3MNvY/mqdefault.jpg',
      description: 'Types of conditional sentences in English',
      favorite: false,
      createdAt: Date.now() - 7500000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en27',
      title: 'Conjunctions in English Grammar',
      url: 'https://www.youtube.com/watch?v=EmxK78_dKwM',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/EmxK78_dKwM/mqdefault.jpg',
      description: 'Understanding conjunctions in English',
      favorite: false,
      createdAt: Date.now() - 7400000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en28',
      title: 'Gerund and Infinitives in English',
      url: 'https://www.youtube.com/watch?v=dsY9CvVygVs',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/dsY9CvVygVs/mqdefault.jpg',
      description: 'Understanding gerunds and infinitives in English',
      favorite: false,
      createdAt: Date.now() - 7300000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en29',
      title: 'Phrasal Verbs for Bank Exams',
      url: 'https://www.youtube.com/watch?v=NcLNEOu8rmY',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/NcLNEOu8rmY/mqdefault.jpg',
      description: 'Important phrasal verbs for bank exams',
      favorite: false,
      createdAt: Date.now() - 7200000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en30',
      title: 'Sentence Completion Strategies',
      url: 'https://www.youtube.com/watch?v=DizNfZpWe78',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/DizNfZpWe78/mqdefault.jpg',
      description: 'Strategies for completing sentences in English',
      favorite: false,
      createdAt: Date.now() - 7100000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en31',
      title: 'Double Fillers in English Grammar',
      url: 'https://www.youtube.com/watch?v=eADp0FupyQM',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/eADp0FupyQM/mqdefault.jpg',
      description: 'How to solve double fillers questions',
      favorite: false,
      createdAt: Date.now() - 7000000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en32',
      title: 'Master Pronouns for Bank Exams',
      url: 'https://www.youtube.com/watch?v=Hu-v0WIZ0fg',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/Hu-v0WIZ0fg/mqdefault.jpg',
      description: 'Mastering pronouns for bank exam questions',
      favorite: false,
      createdAt: Date.now() - 6900000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en33',
      title: 'Verb Tenses Simplified',
      url: 'https://www.youtube.com/watch?v=B09xiHgWpEc',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/B09xiHgWpEc/mqdefault.jpg',
      description: 'Simple explanation of verb tenses for banking exams',
      favorite: false,
      createdAt: Date.now() - 6800000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en34',
      title: 'Punctuation Rules for Bank Exams',
      url: 'https://www.youtube.com/watch?v=3vO2R526zgA',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/3vO2R526zgA/mqdefault.jpg',
      description: 'Important punctuation rules for banking examinations',
      favorite: false,
      createdAt: Date.now() - 6700000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en35',
      title: 'Common Confusing Words in English',
      url: 'https://www.youtube.com/watch?v=NbaKwSYeYgs',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/NbaKwSYeYgs/mqdefault.jpg',
      description: 'Commonly confused words explained for bank exams',
      favorite: false,
      createdAt: Date.now() - 6600000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en36',
      title: 'Grammar Shortcuts for Competitive Exams',
      url: 'https://www.youtube.com/watch?v=HpCYjSwouE4',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/HpCYjSwouE4/mqdefault.jpg',
      description: 'Quick grammar shortcuts for competitive banking exams',
      favorite: false,
      createdAt: Date.now() - 6500000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en37',
      title: 'Word Usage in Bank Exams',
      url: 'https://www.youtube.com/watch?v=oDjjeCK94KQ',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/oDjjeCK94KQ/mqdefault.jpg',
      description: 'Correct word usage for banking examinations',
      favorite: false,
      createdAt: Date.now() - 6400000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en38',
      title: 'Sentence Structure Analysis',
      url: 'https://www.youtube.com/watch?v=4bQffcaMX0A',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/4bQffcaMX0A/mqdefault.jpg',
      description: 'How to analyze sentence structures for bank exams',
      favorite: false,
      createdAt: Date.now() - 6300000,
      videoType: 'youtube',
      comments: []
    },
    {
      id: 'en39',
      title: 'Advanced Grammar Techniques',
      url: 'https://www.youtube.com/watch?v=xaV7Wx-71Dc',
      category: 'english',
      thumbnail: 'https://img.youtube.com/vi/xaV7Wx-71Dc/mqdefault.jpg',
      description: 'Advanced grammar techniques for banking competitive exams',
      favorite: false,
      createdAt: Date.now() - 6200000,
      videoType: 'youtube',
      comments: []
    }
  ];

  saveToLocalStorage(VIDEO_STORAGE_KEY, sampleVideos);
};

// Force refresh all videos to ensure the new english videos appear properly
export const forceRefreshVideos = (): void => {
  const videos = getVideos();
  if (videos.length > 0) {
    const englishVideos = videos.filter(v => v.category === 'english');
    // If we have less than expected English videos, force refresh
    if (englishVideos.length < 30) {
      // Store any user-added videos that are not in the sample set
      const userAddedVideos = videos.filter(v => 
        !v.id.startsWith('1') && 
        !v.id.startsWith('2') && 
        !v.id.startsWith('3') && 
        !v.id.startsWith('4') && 
        !v.id.startsWith('5') && 
        !v.id.startsWith('6') && 
        !v.id.startsWith('7') && 
        !v.id.startsWith('8') && 
        !v.id.startsWith('9') && 
        !v.id.startsWith('r') && 
        !v.id.startsWith('en')
      );
      
      // Clear videos and reimport samples
      clearAllVideos();
      importSampleVideos();
      
      // Re-add user videos
      const updatedVideos = getVideos();
      userAddedVideos.forEach(video => {
        // Check if this video isn't already in the list
        if (!updatedVideos.some(v => v.id === video.id)) {
          addVideo(video);
        }
      });
    }
  } else {
    // If no videos exist, import samples
    importSampleVideos();
  }
};
