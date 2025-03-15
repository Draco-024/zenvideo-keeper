
export type Category = 'aptitude' | 'reasoning' | 'english';
export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastWatched';
export type ViewMode = 'grid' | 'list';
export type ShareOption = 'whatsapp' | 'facebook' | 'twitter' | 'copy' | 'native';

export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  username?: string; // Added username field
}

export interface Video {
  id: string;
  title: string;
  url: string;
  category: Category;
  thumbnail?: string;
  description?: string;
  favorite: boolean;
  createdAt: number;
  videoType: 'youtube' | 'googlephotos';
  lastWatched?: number;
  comments?: Comment[];
  videoAvailable?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  createdAt: number;
}
