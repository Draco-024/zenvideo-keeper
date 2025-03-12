
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

// Playlist Management Functions
export const getPlaylists = (): Playlist[] => {
  const playlists = localStorage.getItem(PLAYLIST_KEY);
  return playlists ? JSON.parse(playlists) : [];
};

export const savePlaylists = (playlists: Playlist[]) => {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists));
};

export const getPlaylistById = (id: string): Playlist | null => {
  const playlists = getPlaylists();
  return playlists.find(playlist => playlist.id === id) || null;
};

export const createPlaylist = (playlist: Playlist) => {
  const playlists = getPlaylists();
  playlists.push(playlist);
  savePlaylists(playlists);
};

export const updatePlaylist = (updatedPlaylist: Playlist) => {
  const playlists = getPlaylists();
  const index = playlists.findIndex((p) => p.id === updatedPlaylist.id);
  if (index !== -1) {
    playlists[index] = updatedPlaylist;
    savePlaylists(playlists);
  }
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
  
  const videos = getVideos();
  return videos.filter(video => playlist.videoIds.includes(video.id));
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
    
    const googlePhotosUrl = 'https://photos.app.goo.gl/PXSHYAWUYip4Uwfi9';
    
    const aptitudeUrls = allYoutubeUrls;
    // Updated English URLs with the new list provided by the user
    const englishUrls = [
      'https://www.youtube.com/watch?v=PqaPr0dAwyo',
      'https://www.youtube.com/watch?v=9HogWXy5y90',
      'https://www.youtube.com/watch?v=C9KFy5czsWY',
      'https://www.youtube.com/watch?v=7E_FRY_8Vvc',
      'https://www.youtube.com/watch?v=kO2Haju7k9U',
      'https://www.youtube.com/watch?v=11RUUZBbG_8',
      'https://www.youtube.com/watch?v=b36YRTv4684',
      'https://www.youtube.com/watch?v=Dy8B-2Bcx7U',
      'https://www.youtube.com/watch?v=IGd4Robx0O0',
      'https://www.youtube.com/watch?v=7Itqz0egSgg',
      'https://www.youtube.com/watch?v=cPYl9IMwV4s',
      'https://www.youtube.com/watch?v=TduqEEgBRHk',
      'https://www.youtube.com/watch?v=fggZusWOFhk',
      'https://www.youtube.com/watch?v=icgwNTcrPyA',
      'https://www.youtube.com/watch?v=IYBy3wQd5M4',
      'https://www.youtube.com/watch?v=YNbL4kebekM',
      'https://www.youtube.com/watch?v=vGxWpd1OfoA',
      'https://www.youtube.com/watch?v=pMCdTONcIDI',
      'https://www.youtube.com/watch?v=xWLZ2l0UA2s',
      'https://www.youtube.com/watch?v=7acbD2qHN4Y',
      'https://www.youtube.com/watch?v=MwuV10B-y8E',
      'https://www.youtube.com/watch?v=9hrgZBSNWQk',
      'https://www.youtube.com/watch?v=8ea8ezvtGRY',
      'https://www.youtube.com/watch?v=k7HIXb5EryM',
      'https://www.youtube.com/watch?v=His7C-X-eOU',
      'https://www.youtube.com/watch?v=7Gg21I3MNvY',
      'https://www.youtube.com/watch?v=EmxK78_dKwM',
      'https://www.youtube.com/watch?v=dsY9CvVygVs',
      'https://www.youtube.com/watch?v=NcLNEOu8rmY',
      'https://www.youtube.com/watch?v=DizNfZpWe78',
      'https://www.youtube.com/watch?v=eADp0FupyQM',
      'https://www.youtube.com/watch?v=Hu-v0WIZ0fg',
      'https://www.youtube.com/watch?v=B09xiHgWpEc',
      'https://www.youtube.com/watch?v=3vO2R526zgA',
      'https://www.youtube.com/watch?v=NbaKwSYeYgs',
      'https://www.youtube.com/watch?v=HpCYjSwouE4',
      'https://www.youtube.com/watch?v=oDjjeCK94KQ',
      'https://www.youtube.com/watch?v=4bQffcaMX0A',
      'https://www.youtube.com/watch?v=xaV7Wx-71Dc'
    ];
    
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
    
    // Updated English titles to match the new URLs
    const englishTitles = [
      'English Grammar Rules for Bank Exams',
      'Verbal Ability Master Class',
      'Reading Comprehension Techniques',
      'Synonyms and Antonyms for Banking',
      'Sentence Improvement Strategies',
      'Para Jumbles Solving Methods',
      'Common Grammar Errors to Avoid',
      'Cloze Test Preparation Tips',
      'Spotting Errors in Sentences',
      'Fill in the Blanks Strategies',
      'Idioms and Phrases Practice',
      'One Word Substitution Guide',
      'Sentence Completion Techniques',
      'Active and Passive Voice Rules',
      'Direct and Indirect Speech',
      'Subject-Verb Agreement in English',
      'Tenses Overview for Bank Exams',
      'Phrases and Clauses Explained',
      'Reading Comprehension Practice Set',
      'Vocabulary Building Techniques',
      'Error Detection Methods',
      'Banking Terminology in English',
      'Passage Comprehension Strategies',
      'Inference Based Questions',
      'Critical Reasoning in English',
      'Contextual Vocabulary Usage',
      'Paragraph Completion Methods',
      'Summary Writing Techniques',
      'English Usage and Grammar Rules',
      'Word Association Practice',
      'High-Level Vocabulary for Banking',
      'Grammar Rules Simplified',
      'Sentence Rearrangement Tricks',
      'Quick Grammar Revision',
      'Banking Terms and Definitions',
      'English Section Time Management',
      'Last-Minute English Preparation',
      'Common Mistakes in Banking English',
      'Quick English Tips for Bank Exams'
    ];
    
    const reasoningDescriptions = reasoningTitles.map(title => 
      `Comprehensive guide on ${title.toLowerCase()} for banking exams. Learn key concepts, shortcuts, and practice with example questions.`
    );
    
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
    
    // Updated English descriptions to match the new content
    const englishDescriptions = [
      'Essential grammar rules you need to know for scoring high in English section.',
      'Comprehensive guide to excel in verbal ability sections of banking exams.',
      'Effective strategies to tackle reading comprehension passages in banking exams.',
      'Master synonyms and antonyms with this comprehensive guide for banking exams.',
      'Learn how to improve sentences with proper structure and grammar.',
      'Techniques to solve para jumbles quickly and accurately.',
      'Identify and avoid common grammar errors that appear in banking exams.',
      'Step-by-step approach to solve cloze test questions effectively.',
      'Learn how to spot errors in sentences quickly for banking exams.',
      'Strategies to tackle fill in the blanks questions with precision.',
      'Common idioms and phrases explained with examples for banking exams.',
      'One word substitution guide to enhance your vocabulary for bank exams.',
      'Techniques to complete sentences grammatically and meaningfully.',
      'Master active and passive voice rules for banking exam questions.',
      'Complete guide to direct and indirect speech conversion.',
      'Important rules of subject-verb agreement for grammar questions.',
      'Comprehensive overview of tenses for banking exam preparation.',
      'Phrases and clauses explained with examples for better understanding.',
      'Practice set for reading comprehension with detailed explanations.',
      'Effective techniques to build vocabulary for banking exams.',
      'Methods to detect errors in sentences quickly and accurately.',
      'Important banking terminology explained in simple English.',
      'Advanced strategies to comprehend complex passages.',
      'How to tackle inference based questions in reading comprehension.',
      'Critical reasoning techniques for English section of banking exams.',
      'Learn to use vocabulary based on context for better accuracy.',
      'Methods to complete paragraphs with coherence and logic.',
      'Techniques for writing concise and accurate summaries.',
      'Important English usage and grammar rules for banking exams.',
      'Practice word associations to improve vocabulary retention.',
      'Advanced vocabulary terms commonly used in banking sector.',
      'Simplified explanation of complex grammar rules for quick learning.',
      'Tricks to rearrange jumbled sentences in logical order.',
      'Quick revision of essential grammar rules for last-minute preparation.',
      'Important banking terms and definitions you should know.',
      'Time management strategies for English section in banking exams.',
      'Last-minute preparation tips for English section of banking exams.',
      'Common mistakes candidates make in banking English section and how to avoid them.',
      'Quick and effective tips to improve your score in English section.'
    ];
    
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
    
    // Updated English videos with the new URLs and titles
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
    
    const sampleVideos: Video[] = [
      ...aptitudeVideos,
      ...reasoningVideos,
      ...englishVideos,
      googlePhotosVideo
    ];
    
    saveVideos(sampleVideos);
    
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
