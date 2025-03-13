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

export type ShareOption = 'copy' | 'whatsapp' | 'facebook' | 'twitter' | 'native';

export interface VideoGridProps {
  videos: Video[];
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (video: Video) => void;
  onFavorite: (video: Video) => void;
  onView: (video: Video) => void;
  showBannerInListView?: boolean;
}
