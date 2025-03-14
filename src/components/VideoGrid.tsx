
import { Video, ViewMode } from '@/types/video';
import { VideoCard } from './VideoCard';
import { motion } from 'framer-motion';
import { VideoListItem } from './VideoListItem';
import { getYouTubeId } from '@/utils/helpers';
import { validateYouTubeUrl } from '@/utils/videoValidator';
import { useEffect, useState } from 'react';

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
  const [validatedVideos, setValidatedVideos] = useState<Video[]>([]);
  const [isValidating, setIsValidating] = useState(false);

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

  useEffect(() => {
    // Ensure all videos have thumbnails
    const videosWithThumbnails = videos.map(video => {
      if (!video.thumbnail) {
        const youtubeId = getYouTubeId(video.url);
        return {
          ...video,
          thumbnail: youtubeId 
            ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` 
            : 'placeholder.svg',
          videoAvailable: true, // Default to true until validated
        };
      }
      return {
        ...video,
        videoAvailable: video.videoAvailable !== false, // Default to true if not set
      };
    });
    
    setValidatedVideos(videosWithThumbnails);
    
    // Pre-validate YouTube videos in background
    const youtubeVideos = videosWithThumbnails.filter(
      v => v.videoType === 'youtube' && v.url.includes('youtube')
    );
    
    if (youtubeVideos.length > 0) {
      setIsValidating(true);
      
      // Stagger validation to avoid too many requests
      const validateVideos = async () => {
        const batchSize = 5;
        const batches = [];
        
        for (let i = 0; i < youtubeVideos.length; i += batchSize) {
          batches.push(youtubeVideos.slice(i, i + batchSize));
        }
        
        const updatedVideos = [...videosWithThumbnails];
        
        for (const batch of batches) {
          const batchPromises = batch.map(async (video) => {
            try {
              const isValid = await validateYouTubeUrl(video.url);
              const videoIndex = updatedVideos.findIndex(v => v.id === video.id);
              
              if (videoIndex !== -1) {
                updatedVideos[videoIndex] = {
                  ...updatedVideos[videoIndex],
                  videoAvailable: isValid,
                };
              }
            } catch (error) {
              console.error('Error validating video:', video.url, error);
            }
          });
          
          await Promise.all(batchPromises);
          setValidatedVideos([...updatedVideos]);
        }
        
        setIsValidating(false);
      };
      
      validateVideos();
    }
  }, [videos]);

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
        {validatedVideos.map((video) => (
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
      {validatedVideos.map((video) => (
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
