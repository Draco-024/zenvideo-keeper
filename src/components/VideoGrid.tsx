
import { Video, ViewMode } from '@/types/video';
import { VideoCard } from './VideoCard';
import { motion } from 'framer-motion';
import { VideoListItem } from './VideoListItem';

export interface VideoGridProps {
  videos: Video[];
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (video: Video) => void;
  onFavorite: (video: Video) => void;
  onView: (video: Video) => void;
  showBannerInListView?: boolean;
}

export const VideoGrid = ({ 
  videos, 
  viewMode, 
  onDelete, 
  onEdit, 
  onFavorite, 
  onView,
  showBannerInListView = true
}: VideoGridProps) => {
  const handleFavoriteToggle = (video: Video) => {
    onFavorite(video);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (viewMode === 'grid') {
    return (
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {videos.map((video) => (
          <motion.div key={video.id} variants={item}>
            <VideoCard 
              video={video} 
              onView={onView} 
              onFavorite={handleFavoriteToggle}
              onChangeCategory={onEdit}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div 
      className="space-y-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {videos.map((video) => (
        <motion.div key={video.id} variants={item}>
          <VideoListItem 
            video={video} 
            onView={onView} 
            onFavorite={handleFavoriteToggle} 
            onEdit={onEdit} 
            onDelete={() => onDelete(video.id)}
            showBanner={showBannerInListView}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
