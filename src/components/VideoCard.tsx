
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Video } from "@/types/video";
import { formatDistanceToNow } from 'date-fns';
import { Star, StarOff, BookOpen, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChangeCategoryDialog } from './ChangeCategoryDialog';
import { ShareDialog } from './ShareDialog';
import { useMediaQuery } from '@/hooks/use-media-query';

interface VideoCardProps {
  video: Video;
  onView: (video: Video) => void;
  onFavorite: (video: Video) => void;
  onChangeCategory: (video: Video) => void;
}

export const VideoCard = ({
  video,
  onView,
  onFavorite,
  onChangeCategory
}: VideoCardProps) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const thumbnailUrl = video.thumbnail || 'placeholder.svg';

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-md">
        <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => onView(video)}>
          <img 
            src={thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
          
          {video.favorite && (
            <div className="absolute top-2 right-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          )}
          
          <div className="absolute bottom-2 right-2">
            <Badge variant={video.category === 'aptitude' ? 'default' : video.category === 'reasoning' ? 'secondary' : 'outline'}>
              {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold line-clamp-2 mb-1" onClick={() => onView(video)}>{video.title}</h3>
          <p className="text-xs text-muted-foreground">
            Added {formatDistanceToNow(video.createdAt, { addSuffix: true })}
          </p>
        </CardContent>
        
        <CardFooter className="p-2 border-t flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => onFavorite(video)} title={video.favorite ? "Remove from favorites" : "Add to favorites"}>
            {video.favorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
          </Button>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsShareDialogOpen(true)} title="Share video">
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => setIsCategoryDialogOpen(true)} title="Change category">
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ChangeCategoryDialog
        open={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        video={video}
        onCategoryChange={onChangeCategory}
      />
      
      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        video={video}
      />
    </>
  );
};
