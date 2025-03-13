
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
  layoutMode?: 'horizontal' | 'vertical';
}

export const VideoGrid = ({ 
  videos, 
  viewMode, 
  onDelete, 
  onEdit, 
  onFavorite, 
  onView,
  showBannerInListView = true,
  layoutMode = 'vertical'
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

  // Ensure all videos have valid thumbnails
  const validVideos = videos.map(video => {
    if (!video.thumbnail) {
      return {
        ...video,
        thumbnail: `https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`
      };
    }
    return video;
  });

  const horizontalClassName = layoutMode === 'horizontal' 
    ? 'flex flex-row flex-nowrap overflow-x-auto pb-4 space-y-0 space-x-2 hide-scrollbar' 
    : '';
    
  if (viewMode === 'grid') {
    return (
      <motion.div 
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
          layoutMode === 'horizontal' ? 'flex flex-row flex-nowrap overflow-x-auto pb-4 grid-flow-col auto-cols-max hide-scrollbar' : ''
        }`}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {validVideos.map((video) => (
          <motion.div key={video.id} variants={item} className={layoutMode === 'horizontal' ? 'min-w-[280px] flex-shrink-0 mx-1' : ''}>
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
      className={`space-y-2 ${horizontalClassName}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {validVideos.map((video) => (
        <motion.div 
          key={video.id} 
          variants={item}
          className={layoutMode === 'horizontal' ? 'min-w-[400px] flex-shrink-0 mx-1' : ''}
        >
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

// Helper function to extract YouTube ID
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}
