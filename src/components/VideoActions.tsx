
import { Star, StarOff, Edit, Trash, ExternalLink, Share2, FolderPlus, Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Video } from '@/types/video';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState } from 'react';
import { DownloadDialog } from './DownloadDialog';

interface VideoActionsProps {
  video: Video;
  onToggleFavorite: () => void;
  onOpenEditDialog: () => void;
  onOpenShareDialog: () => void;
  onOpenPlaylistDialog: () => void;
  onOpenCategoryDialog: () => void;
  onDeleteVideo: () => void;
}

export const VideoActions = ({ 
  video, 
  onToggleFavorite, 
  onOpenEditDialog,
  onOpenShareDialog,
  onOpenPlaylistDialog,
  onOpenCategoryDialog,
  onDeleteVideo
}: VideoActionsProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const isYouTubeVideo = video.videoType === 'youtube';

  return (
    <div className="flex flex-wrap gap-2 video-actions justify-end">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleFavorite}
        className={video.favorite ? "text-yellow-500" : ""}
        title={video.favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {video.favorite ? <Star className="h-4 w-4 fill-yellow-500" /> : <StarOff className="h-4 w-4" />}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onOpenCategoryDialog}
        title="Change category"
      >
        <BookOpen className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onOpenShareDialog}
        title="Share video"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onOpenPlaylistDialog}
        title="Add to playlist"
      >
        <FolderPlus className="h-4 w-4" />
      </Button>
      
      {isYouTubeVideo && (
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsDownloadDialogOpen(true)}
          title="Download video"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onOpenEditDialog}
        title="Edit video"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="text-red-500" title="Delete video">
            <Trash className="h-4 w-4" />
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
            <AlertDialogAction onClick={onDeleteVideo} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Button variant="outline" size="icon" asChild title="View on YouTube">
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>

      {isDownloadDialogOpen && (
        <DownloadDialog
          open={isDownloadDialogOpen}
          onClose={() => setIsDownloadDialogOpen(false)}
          videoUrl={video.url}
          videoTitle={video.title}
        />
      )}
    </div>
  );
};
