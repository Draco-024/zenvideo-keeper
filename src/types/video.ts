
export type Category = string;
export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastWatched';
export type ViewMode = 'grid' | 'list';

export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  username?: string;
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

export type ShareOption = 'whatsapp' | 'facebook' | 'twitter' | 'copy' | 'native';

export interface CategorySettings {
  id: string;
  name: string;
  order: number;
}

// Default categories
export const DEFAULT_CATEGORIES: CategorySettings[] = [
  { id: 'aptitude', name: 'Aptitude', order: 0 },
  { id: 'reasoning', name: 'Reasoning', order: 1 },
  { id: 'english', name: 'English', order: 2 }
];
