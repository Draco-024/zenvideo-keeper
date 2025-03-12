
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVideoById, updateVideo, addCommentToVideo } from '@/utils/storage';
import { Video, Comment } from '@/types/video';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { EditVideoDialog } from '@/components/EditVideoDialog';
import { ShareDialog } from '@/components/ShareDialog';
import { PlaylistDialog } from '@/components/PlaylistDialog';
import { CommentSection } from '@/components/CommentSection';
import { VideoHeader } from '@/components/VideoHeader';
import { VideoActions } from '@/components/VideoActions';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoDescription } from '@/components/VideoDescription';

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundVideo = getVideoById(id);
      if (foundVideo) {
        setVideo(foundVideo);
      } else {
        toast({
          title: "Video Not Found",
          description: "The requested video could not be found.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    const handleBackNavigation = (e: PopStateEvent) => {
      e.preventDefault();
      navigate('/');
    };

    window.addEventListener('popstate', handleBackNavigation);

    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [navigate]);

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    const updatedVideo = { ...video, favorite: !video.favorite };
    updateVideo(updatedVideo);
    setVideo(updatedVideo);
    toast({
      title: updatedVideo.favorite ? "Added to Favorites" : "Removed from Favorites",
      description: updatedVideo.favorite 
        ? "This video has been added to your favorites."
        : "This video has been removed from your favorites."
    });
  };

  const handleUpdateVideo = (updatedVideo: Video) => {
    updateVideo(updatedVideo);
    setVideo(updatedVideo);
    toast({
      title: "Video Updated",
      description: "The video details have been updated successfully."
    });
  };

  const handleDeleteVideo = () => {
    if (id) {
      const deleteVideoById = (id: string) => {
        const videos = JSON.parse(localStorage.getItem('bankzen_videos') || '[]');
        const filteredVideos = videos.filter((v: Video) => v.id !== id);
        localStorage.setItem('bankzen_videos', JSON.stringify(filteredVideos));
      };
      
      deleteVideoById(id);
      toast({
        title: "Video Deleted",
        description: "The video has been deleted successfully."
      });
      navigate('/');
    }
  };

  const handleAddComment = (commentText: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!video || !video.id) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      createdAt: Date.now(),
      text: commentText.text,
      username: commentText.username
    };
    
    const updatedVideo = addCommentToVideo(video.id, newComment);
    if (updatedVideo) {
      setVideo(updatedVideo);
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="max-w-7xl mx-auto p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <VideoHeader video={video} setVideo={setVideo} />
        
        <VideoActions 
          video={video}
          onToggleFavorite={handleToggleFavorite}
          onOpenEditDialog={() => setIsEditDialogOpen(true)}
          onOpenShareDialog={() => setIsShareDialogOpen(true)}
          onOpenPlaylistDialog={() => setIsPlaylistDialogOpen(true)}
          onDeleteVideo={handleDeleteVideo}
        />
        
        <VideoPlayer video={video} />
        
        {video.description && (
          <VideoDescription description={video.description} />
        )}
        
        <div className="p-4 sm:p-6 rounded-lg bg-card mb-4 sm:mb-6">
          <CommentSection 
            videoId={video.id}
            comments={video.comments || []}
            onAddComment={handleAddComment}
            youtubeUrl={video.videoType === 'youtube' ? video.url : undefined}
          />
        </div>
      </motion.div>

      <EditVideoDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        video={video}
        onEdit={handleUpdateVideo}
      />
      
      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        video={video}
      />
      
      <PlaylistDialog
        open={isPlaylistDialogOpen}
        onClose={() => setIsPlaylistDialogOpen(false)}
        video={video}
      />
    </div>
  );
};

export default VideoPage;
