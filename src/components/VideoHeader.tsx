
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '@/types/video';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { updateVideo } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

interface VideoHeaderProps {
  video: Video;
  setVideo: React.Dispatch<React.SetStateAction<Video | null>>;
}

export const VideoHeader = ({ video, setVideo }: VideoHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(video.title);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      const updatedVideo = { ...video, title: editedTitle };
      updateVideo(updatedVideo);
      setVideo(updatedVideo);
      setIsEditingTitle(false);
      toast({
        title: "Title Updated",
        description: "The video title has been updated successfully."
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mr-auto sm:mr-4 w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="flex-1">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-lg font-bold"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveTitle}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setIsEditingTitle(false);
              setEditedTitle(video.title);
            }}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold line-clamp-2 text-left">{video.title}</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditingTitle(true)}
              title="Edit title"
              className="flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-muted-foreground text-sm text-left video-meta">
          <span>
            {video.category.charAt(0).toUpperCase() + video.category.slice(1)} • 
            {video.createdAt && ` Added ${formatDistanceToNow(video.createdAt, { addSuffix: true })}`}
          </span>
          <span>
            {video.lastWatched && ` Last watched ${formatDistanceToNow(video.lastWatched, { addSuffix: true })}`}
          </span>
        </p>
      </div>
    </div>
  );
};
