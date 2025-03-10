
import { Video, ViewMode } from '../types/video';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Star, Edit, Trash, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface VideoGridProps {
  videos: Video[];
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (video: Video) => void;
  onFavorite: (video: Video) => void;
  onView: (video: Video) => void;
}

export const VideoGrid = ({ videos, viewMode, onDelete, onEdit, onFavorite, onView }: VideoGridProps) => {
  const getYouTubeId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : '';
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative cursor-pointer" onClick={() => onView(video)}>
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`}
                      alt={video.title}
                      className="absolute w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polygon points="5 3 19 12 5 21 5 3" fill="white" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {video.favorite && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-500/80 text-white">
                        <Star className="h-3 w-3 mr-1 fill-white" />
                        Favorite
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 
                    className="font-semibold mb-2 line-clamp-2 hover:text-primary/80 transition-colors cursor-pointer"
                    onClick={() => onView(video)}
                  >
                    {video.title}
                  </h3>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline" className="capitalize">
                        {video.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(video.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${video.favorite ? 'text-yellow-500' : ''}`}
                          onClick={() => onFavorite(video)}
                          title={video.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={`h-4 w-4 ${video.favorite ? 'fill-yellow-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(video)}
                          title="Edit video"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => onDelete(video.id)}
                          title="Delete video"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        title="Open in YouTube"
                      >
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden p-3 sm:p-4 hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <div 
                  className="relative w-full sm:w-48 aspect-video rounded-md overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => onView(video)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polygon points="5 3 19 12 5 21 5 3" fill="white" />
                      </svg>
                    </div>
                  </div>
                  {video.favorite && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-500/80 text-white">
                        <Star className="h-3 w-3 mr-1 fill-white" />
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 
                        className="font-semibold text-base sm:text-lg line-clamp-1 cursor-pointer hover:text-primary/80 transition-colors"
                        onClick={() => onView(video)}
                      >
                        {video.title}
                      </h3>
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <Badge variant="outline" className="capitalize">
                          {video.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm my-1 line-clamp-1">
                      {video.description || "No description available"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(video.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-end mt-2 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${video.favorite ? 'text-yellow-500' : ''}`}
                      onClick={() => onFavorite(video)}
                      title={video.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`h-4 w-4 ${video.favorite ? 'fill-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(video)}
                      title="Edit video"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => onDelete(video.id)}
                      title="Delete video"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title="Open in YouTube"
                    >
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
