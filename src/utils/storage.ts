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
    ];
    
    // Reasoning YouTube URLs - replacing with new videos
    const reasoningUrls = [
      'https://www.youtube.com/watch?v=NcLSjxKVT_k',
      'https://www.youtube.com/watch?v=rsibH4hdb9k',
      'https://www.youtube.com/watch?v=UDtRdWFs8Ic',
      'https://www.youtube.com/watch?v=TctOHV-Rx54',
      'https://www.youtube.com/watch?v=YHtGwVveuKA',
      'https://www.youtube.com/watch?v=lGl5qBkUFsY',
      'https://www.youtube.com/watch?v=z5H6R8P1wPI',
      'https://www.youtube.com/watch?v=a-RhMfESmlE',
      'https://www.youtube.com/watch?v=alNW7rLRdqE',
      'https://www.youtube.com/watch?v=sDSmwrRcC4o',
      'https://www.youtube.com/watch?v=vtRyJQv9IBg',
      'https://www.youtube.com/watch?v=5pPkt6pHTqQ',
      'https://www.youtube.com/watch?v=BaLxvkO8aS0',
      'https://www.youtube.com/watch?v=Wpd5zMfmZy8',
      'https://www.youtube.com/watch?v=Y16f-tQSpQg',
      'https://www.youtube.com/watch?v=czOyV0OklOA',
      'https://www.youtube.com/watch?v=dVSjBTOP1EA',
      'https://www.youtube.com/watch?v=G-Or_P2uV0g',
      'https://www.youtube.com/watch?v=noSZFcoH8Js',
      'https://www.youtube.com/watch?v=kWupr9Xt8e0',
      'https://www.youtube.com/watch?v=yqCSPmhk9pA',
      'https://www.youtube.com/watch?v=-rCBLQCWz5Q',
      'https://www.youtube.com/watch?v=F8QF5eC6BWQ',
      'https://www.youtube.com/watch?v=nxKQdasXnOc',
      'https://www.youtube.com/watch?v=gzdhHq_OgU8',
      'https://www.youtube.com/watch?v=UUOiYHcXxBg',
      'https://www.youtube.com/watch?v=dK1tzmDbMoA',
      'https://www.youtube.com/watch?v=IJJlHAzwWBY',
      'https://www.youtube.com/watch?v=2TKVQo1l1nw',
      'https://www.youtube.com/watch?v=3gxjtn90Gi8',
      'https://www.youtube.com/watch?v=x3O5Vn4Acig',
      'https://www.youtube.com/watch?v=HTDtOhIH6Vg',
      'https://www.youtube.com/watch?v=IcWxx-zQDCc',
      'https://www.youtube.com/watch?v=P--pT2kA-1U',
      'https://www.youtube.com/watch?v=CG9i0XNB6lI',
      'https://www.youtube.com/watch?v=QrKXk3zefkI',
      'https://www.youtube.com/watch?v=lVuRfeII0tQ',
      'https://www.youtube.com/watch?v=gwhqtpeLuHE',
      'https://www.youtube.com/watch?v=8tQGrKEL4hM',
      'https://www.youtube.com/watch?v=XQelk03FvIU',
      'https://www.youtube.com/watch?v=hc5J8Wz1lcc',
      'https://www.youtube.com/watch?v=_FK-HQAV8Po',
      'https://www.youtube.com/watch?v=kl5d33oo48c',
      'https://www.youtube.com/watch?v=W6Et3oZW3VQ',
      'https://www.youtube.com/watch?v=7OWzDBmmqHo',
      'https://www.youtube.com/watch?v=8JP5C0Efqr0',
      'https://www.youtube.com/watch?v=RuGxun4-nGc',
      'https://www.youtube.com/watch?v=ZaBoSUl9SGc',
      'https://www.youtube.com/watch?v=Cv249sPF358',
      'https://www.youtube.com/watch?v=zZvnY1yCb4o',
      'https://www.youtube.com/watch?v=ETEV0G65IXs',
      'https://www.youtube.com/watch?v=fCkRwrNfmHs',
      'https://www.youtube.com/watch?v=Z_-H2jweZIo',
      'https://www.youtube.com/watch?v=bs9S-lgx1hw',
      'https://www.youtube.com/watch?v=N-tr1QlAXQA',
      'https://www.youtube.com/watch?v=KLYUklutzJ0',
      'https://www.youtube.com/watch?v=S83rUl8uSTA',
      'https://www.youtube.com/watch?v=_NLUCJOSQLc',
      'https://www.youtube.com/watch?v=mxnhfzWdiPk',
      'https://www.youtube.com/watch?v=k8Jfgi48AvA',
      'https://www.youtube.com/watch?v=LCHvjrb49k4',
      'https://www.youtube.com/watch?v=8E6kWdajj_s',
      'https://www.youtube.com/watch?v=w1b2tgsP4p0',
      'https://www.youtube.com/watch?v=w_6dy9_VQNM',
      'https://www.youtube.com/watch?v=4hWJccdHoAc',
      'https://www.youtube.com/watch?v=GpBtdjAd1U8',
      'https://www.youtube.com/watch?v=jHb0cvIY1vI',
      'https://www.youtube.com/watch?v=n8NWhN6eDqU',
      'https://www.youtube.com/watch?v=B6VHmQNb_00',
      'https://www.youtube.com/watch?v=p6EenV34sPg',
      'https://www.youtube.com/watch?v=ihwzqgTvsWE',
      'https://www.youtube.com/watch?v=1Er7YZsfyfQ',
      'https://www.youtube.com/watch?v=TYY_YZsfyfQ',
      'https://www.youtube.com/watch?v=Ask_cOZsAOk',
      'https://www.youtube.com/watch?v=YHBecJXLl-M',
      'https://www.youtube.com/watch?v=41Z3Dk-B6tM'
    ];
    
    // Add Google Photos URL
    const googlePhotosUrl = 'https://photos.app.goo.gl/PXSHYAWUYip4Uwfi9';
    
    const aptitudeUrls = allYoutubeUrls;
    const englishUrls = [
      'https://www.youtube.com/watch?v=Z9CWHZfSHyI',
      'https://www.youtube.com/watch?v=9_J3NfESEbs',
      'https://www.youtube.com/watch?v=Q6d0PaPB8ww',
      'https://www.youtube.com/watch?v=rOjb8QvuQ2s',
      'https://www.youtube.com/watch?v=okVMuUua5AE',
      'https://www.youtube.com/watch?v=ya5V4g5XYb4',
      'https://www.youtube.com/watch?v=tgc4zxv92co',
      'https://www.youtube.com/watch?v=2BkrbyQ8ZrE',
    ];
    
    // Titles for reasoning videos
    const reasoningTitles = [
      'Logical Reasoning for Banking Exams - Introduction',
      'Syllogism Shortcuts and Tricks',
      'Blood Relations Reasoning Problems',
      'Coding-Decoding Pattern Analysis',
      'Direction Sense Test Strategies',
      'Order and Ranking Problems',
      'Series Completion Techniques',
      'Statement and Arguments',
      'Assumptions and Inferences',
      'Verbal Reasoning Practice Set',
      'Data Sufficiency in Reasoning',
      'Analytical Reasoning Methods',
      'Puzzles and Arrangements',
      'Logical Deductions Master Class',
      'Critical Reasoning Approaches',
      'Input-Output Patterns',
      'Machine Input Problems',
      'Alpha-Numeric Sequence Puzzles',
      'Logical Venn Diagrams',
      'Logical Connectives',
      'Cause and Effect Reasoning',
      'Classification Patterns',
      'Decision Making Strategies',
      'Series Completion Advanced',
      'Number and Letter Analogy',
      'Seating Arrangement Circular',
      'Linear Seating Arrangement',
      'Complex Arrangement Problems',
      'Scheduling Based Puzzles',
      'Coding in Different Languages',
      'Letter Series Problems',
      'Number Series in Reasoning',
      'Binary Logic Applications',
      'Visual Reasoning Basics',
      'Cubes and Dice Problems',
      'Clock and Calendar Problems',
      'Statement Conclusion Questions',
      'Course of Action Problems',
      'Making Judgements Reasoning',
      'Assertion and Reason',
      'Logical Deduction Advanced',
      'Logical Sequence of Words',
      'Symbol Based Logic',
      'Matrix Arrangement Problems',
      'Constraints Based Puzzles',
      'Complex Blood Relations',
      'Word Formation Problems',
      'Verbal Classification',
      'Word Analogies',
      'Logical Consistency Questions',
      'Multiple Statement Problems',
      'Odd One Out Techniques',
      'Theme Detection in Series',
      'Double Lineup Puzzles',
      'Logical Matching Problems',
      'Verification of Truth',
      'Strengthening Arguments',
      'Weakening Arguments',
      'Assumption Identification',
      'Inference Problems Advanced',
      'Mixed Reasoning Set',
      'Non-Verbal Pattern Recognition',
      'Sequential Output Problems',
      'Analytical Decision Making',
      'Bank PO Special Reasoning',
      'SBI Clerk Reasoning Practice',
      'IBPS Reasoning Questions',
      'RBI Grade B Reasoning',
      'Banking Exam Special Reasoning',
      'Competitive Exam Reasoning',
      'Final Mock Test Reasoning',
      'Time-Based Reasoning Strategies',
      'Last Minute Reasoning Tips'
    ];
    
    // For aptitude and english, keep existing titles
    const aptitudeTitles = [
      'Bank Exam Number Series Tricks',
      'Quantitative Aptitude Shortcut Methods',
      'Data Interpretation Strategies',
      'Time and Work Problem Solving',
      'Percentage Problems Shortcuts',
      'Ratio and Proportion Techniques',
      'Profit and Loss Easy Methods',
      'Simple and Compound Interest',
    ];
    
    const englishTitles = [
      'English Grammar Rules for Bank Exams',
      'Verbal Ability Master Class',
      'Banking Awareness Key Topics',
      'Computer Knowledge for Banking Exams',
      'General Knowledge Quick Review',
      'Current Affairs for Bank Exams',
      'Grammar Rules for Bank Exams',
      'Reading Comprehension Strategies',
    ];
    
    // Descriptions for reasoning videos - simplified for brevity
    const reasoningDescriptions = reasoningTitles.map(title => 
      `Comprehensive guide on ${title.toLowerCase()} for banking exams. Learn key concepts, shortcuts, and practice with example questions.`
    );
    
    // For aptitude and english, keep existing descriptions
    const aptitudeDescriptions = [
      'Learn advanced techniques for solving number series questions quickly.',
      'Shortcut methods to solve quantitative aptitude problems in less time.',
      'Step-by-step approach to tackle complex data interpretation questions.',
      'Quick techniques to solve time and work problems with minimal calculations.',
      'Master percentage problems with these quick calculation techniques.',
      'Easy methods to solve ratio and proportion questions in banking exams.',
      'Profit and loss concepts explained with shortcuts for quick calculations.',
      'Simple and compound interest problems solved with practical examples.',
    ];
    
    const englishDescriptions = [
      'Essential grammar rules you need to know for scoring high in English section.',
      'Comprehensive guide to excel in verbal ability sections of banking exams.',
      'Important banking awareness topics you must know for all banking exams.',
      'Essential computer knowledge concepts tested in banking exams.',
      'Quick review of important general knowledge topics for banking exams.',
      'Latest current affairs that are important for upcoming banking exams.',
      'Important grammar rules you must know for banking exam English section.',
      'Strategies to tackle reading comprehension passages effectively.',
    ];
    
    // Create sample aptitude videos
    const aptitudeVideos: Video[] = aptitudeUrls.map((url, index) => ({
      id: `aptitude-${index + 1}`,
      title: aptitudeTitles[index] || `Aptitude Video ${index + 1}`,
      url,
      category: 'aptitude',
      description: aptitudeDescriptions[index] || 'Aptitude video for banking exam preparation.',
      createdAt: Date.now() - (index * 86400000), // Different days
      favorite: index < 3, // First three are favorites
      thumbnail: `https://img.youtube.com/vi/${getYouTubeIdFromUrl(url)}/mqdefault.jpg`,
      videoType: 'youtube',
      comments: [],
      playlists: []
    }));
    
    // Create sample reasoning videos
    const reasoningVideos: Video[] = reasoningUrls.map((url, index) => ({
      id: `reasoning-${index + 1}`,
      title: reasoningTitles[index] || `Reasoning Video ${index + 1}`,
      url,
      category: 'reasoning',
      description: reasoningDescriptions[index] || 'Reasoning video for banking exam preparation.',
      createdAt: Date.now() - (index * 43200000), // Different half-days
      favorite: index < 5, // First five are favorites
      thumbnail: `https://img.youtube.com/vi/${getYouTubeIdFromUrl(url)}/mqdefault.jpg`,
      videoType: 'youtube',
      comments: [],
      playlists: []
    }));
    
    // Create sample english videos
    const englishVideos: Video[] = englishUrls.map((url, index) => ({
      id: `english-${index + 1}`,
      title: englishTitles[index] || `English Video ${index + 1}`,
      url,
      category: 'english',
      description: englishDescriptions[index] || 'English video for banking exam preparation.',
      createdAt: Date.now() - (index * 86400000), // Different days
      favorite: index < 2, // First two are favorites
      thumbnail: `https://img.youtube.com/vi/${getYouTubeIdFromUrl(url)}/mqdefault.jpg`,
      videoType: 'youtube',
      comments: [],
      playlists: []
    }));
    
    // Add Google Photos collection
    const googlePhotosVideo: Video = {
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
    };
    
    // Combine all videos
    const sampleVideos: Video[] = [
      ...aptitudeVideos,
      ...reasoningVideos,
      ...englishVideos,
      googlePhotosVideo
    ];
    
    saveVideos(sampleVideos);
    
    // Create a few sample playlists
    const samplePlaylists: Playlist[] = [
      {
        id: 'playlist-1',
        name: 'Aptitude Essentials',
        description: 'Key videos for mastering aptitude',
        videoIds: aptitudeVideos
          .slice(0, 5)
          .map(v => v.id),
        createdAt: Date.now()
      },
      {
        id: 'playlist-2',
        name: 'English Fundamentals',
        description: 'Must-watch videos for English section',
        videoIds: englishVideos
          .slice(0, 5)
          .map(v => v.id),
        createdAt: Date.now() - 86400000
      },
      {
        id: 'playlist-3',
        name: 'Reasoning Masterclass',
        description: 'Essential reasoning videos for bank exams',
        videoIds: reasoningVideos
          .slice(0, 8)
          .map(v => v.id),
        createdAt: Date.now() - 172800000
      }
    ];
    
    savePlaylists(samplePlaylists);
  }
};
