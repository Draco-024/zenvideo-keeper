
import { Star, StarOff, Edit, Trash, ExternalLink, Share2, FolderPlus, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Video } from '@/types/video';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useNavigate } from 'react-router-dom';

interface VideoActionsProps {
  video: Video;
  onToggleFavorite: () => void;
  onOpenEditDialog: () => void;
  onOpenShareDialog: () => void;
  onOpenPlaylistDialog: () => void;
  onDeleteVideo: () => void;
}

export const VideoActions = ({ 
  video, 
  onToggleFavorite, 
  onOpenEditDialog,
  onOpenShareDialog,
  onOpenPlaylistDialog,
  onDeleteVideo
}: VideoActionsProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const navigate = useNavigate();

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
      
      <Button variant="outline" size="icon" asChild title="Open in original site">
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/favorites')}
        title="Go to favorites"
      >
        <Bookmark className="h-4 w-4 mr-1" />
        {!isMobile && "Favorites"}
      </Button>
    </div>
  );
};
