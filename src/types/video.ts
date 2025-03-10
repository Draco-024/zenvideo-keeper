
export interface Video {
  id: string;
  title: string;
  url: string;
  category: 'aptitude' | 'reasoning' | 'english';
  thumbnail?: string;
  createdAt: number;
  description?: string;
  favorite?: boolean;
  lastWatched?: number;
  videoType?: 'youtube' | 'googlephotos';
  playlists?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  username?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoIds: string[];
  createdAt: number;
}

export type Category = 'aptitude' | 'reasoning' | 'english';

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastWatched';

export type ViewMode = 'grid' | 'list';

export type ShareOption = 'whatsapp' | 'copy' | 'facebook' | 'twitter';
