
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
}

export type Category = 'aptitude' | 'reasoning' | 'english';

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastWatched';

export type ViewMode = 'grid' | 'list';
