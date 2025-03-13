
import { useState, useEffect } from 'react';
import { Video } from '@/types/video';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Star, StarOff, Edit, Trash, BookOpen, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ChangeCategoryDialog } from './ChangeCategoryDialog';
import { getYouTubeId } from '@/utils/helpers';
import { isDeletedYouTubeVideo } from '@/utils/videoValidator';

interface VideoListItemProps {
  video: Video;
  onView: (video: Video) => void;
  onFavorite: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: () => void;
  showBanner?: boolean;
}

export const VideoListItem = ({ 
  video, 
  onView, 
  onFavorite, 
  onEdit, 
  onDelete,
  showBanner = true
}: VideoListItemProps) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(video.thumbnail || 'placeholder.svg');
  const [isVideoUnavailable, setIsVideoUnavailable] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Check if the video might be unavailable
  useEffect(() => {
    const checkVideoAvailability = async () => {
      if (video.videoType === 'youtube') {
        const videoId = getYouTubeId(video.url);
        if (videoId) {
          const isDeleted = await isDeletedYouTubeVideo(videoId);
          setIsVideoUnavailable(isDeleted);
          
          // If we don't have a thumbnail already, set it
          if (!video.thumbnail) {
            setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
          }
        }
      }
    };
    
    checkVideoAvailability();
  }, [video.url, video.videoType, video.thumbnail]);

  return (
    <>
      <Card className={`overflow-hidden hover:shadow-md transition-shadow duration-300 ${isVideoUnavailable ? 'opacity-80' : ''}`}>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div 
              className="relative w-full sm:w-48 aspect-video sm:aspect-[16/10] cursor-pointer"
              onClick={() => onView(video)}
            >
              <img 
                src={thumbnailUrl} 
                alt={video.title} 
                className={`w-full h-full object-cover ${thumbnailError || isVideoUnavailable ? 'opacity-60' : ''}`}
                onError={(e) => {
                  setThumbnailError(true);
                  const target = e.target as HTMLImageElement;
                  target.src = 'placeholder.svg';
                }}
              />
              {video.favorite && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              )}
              
              {isVideoUnavailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="bg-black/80 p-2 rounded-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-white">May be unavailable</span>
                  </div>
                </div>
              )}
              
              {showBanner && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant={video.category === 'aptitude' ? 'default' : video.category === 'reasoning' ? 'secondary' : 'outline'}>
                    {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 
                  className="font-semibold mb-1 cursor-pointer hover:text-primary transition-colors duration-200"
                  onClick={() => onView(video)}
                >
                  {video.title}
                </h3>
                {!showBanner && (
                  <Badge className="mb-2" variant={video.category === 'aptitude' ? 'default' : video.category === 'reasoning' ? 'secondary' : 'outline'}>
                    {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mb-2">
                  Added {formatDistanceToNow(video.createdAt, { addSuffix: true })}
                </p>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                )}
              </div>
              
              <div className="flex space-x-1 mt-2">
                <Button variant="ghost" size="sm" onClick={() => onFavorite(video)}>
                  {video.favorite ? (
                    <>
                      <StarOff className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Unfavorite</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Favorite</span>
                    </>
                  )}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Change Category</span>
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => onEdit(video)}>
                  <Edit className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the video
                        from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangeCategoryDialog
        open={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        video={video}
        onCategoryChange={onEdit}
      />
    </>
  );
};
