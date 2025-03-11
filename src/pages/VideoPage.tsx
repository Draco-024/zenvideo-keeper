
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVideoById, updateVideo, addCommentToVideo } from '@/utils/storage';
import { Video, Comment } from '@/types/video';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, StarOff, Edit, Trash, ExternalLink, Share2, FolderPlus, MessageCircle, Save, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { EditVideoDialog } from '@/components/EditVideoDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { ShareDialog } from '@/components/ShareDialog';
import { PlaylistDialog } from '@/components/PlaylistDialog';
import { CommentSection } from '@/components/CommentSection';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (id) {
      const foundVideo = getVideoById(id);
      if (foundVideo) {
        setVideo(foundVideo);
        setEditedTitle(foundVideo.title);
      } else {
        toast({
          title: "Video Not Found",
          description: "The requested video could not be found.",
          variant: "destructive"
        });
        navigate('/home');
      }
    }
  }, [id, navigate]);

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
      navigate('/home');
    }
  };

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

  const handleAddComment = (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      createdAt: Date.now()
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

  const getEmbedUrl = () => {
    if (video.videoType === 'googlephotos') {
      // For Google Photos, we'll return the direct URL
      return video.url;
    } else {
      // For YouTube
      const youtubeId = getYouTubeId(video.url);
      return `https://www.youtube.com/embed/${youtubeId}`;
    }
  };

  // Function to format description with clickable links
  const formatDescription = (description: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the description by the URLs
    const parts = description.split(urlRegex);
    
    // Match all URLs in the description
    const urls = description.match(urlRegex) || [];
    
    // Combine parts and URLs
    const formattedParts = [];
    for (let i = 0; i < parts.length; i++) {
      formattedParts.push(parts[i]);
      if (i < urls.length) {
        formattedParts.push(
          <a 
            key={i} 
            href={urls[i]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {urls[i]}
          </a>
        );
      }
    }
    
    return formattedParts;
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="max-w-7xl mx-auto p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
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
                {video.lastWatched && `Last watched ${formatDistanceToNow(video.lastWatched, { addSuffix: true })}`}
              </span>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 video-actions justify-end">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleToggleFavorite}
              className={video.favorite ? "text-yellow-500" : ""}
              title={video.favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {video.favorite ? <Star className="h-4 w-4 fill-yellow-500" /> : <StarOff className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsShareDialogOpen(true)}
              title="Share video"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsPlaylistDialogOpen(true)}
              title="Add to playlist"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
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
                  <AlertDialogAction onClick={handleDeleteVideo} className="bg-red-500 hover:bg-red-600">
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
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-md bg-black mb-4 sm:mb-6">
          <div className="aspect-video">
            {video.videoType === 'googlephotos' ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-4"
                >
                  <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M8 2v20" />
                      <path d="M16 2v20" />
                      <path d="M2 8h20" />
                      <path d="M2 16h20" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Open Google Photos Collection</span>
                  <span className="text-sm text-gray-400">Click to view in Google Photos</span>
                </a>
              </div>
            ) : (
              <iframe
                src={getEmbedUrl()}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
              />
            )}
          </div>
        </div>
        
        {video.description && (
          <div className="p-4 sm:p-6 rounded-lg bg-card mb-4 sm:mb-6 video-description">
            <h2 className="text-lg font-semibold mb-2 text-left">Description</h2>
            <div className="text-muted-foreground whitespace-pre-line text-left">
              {formatDescription(video.description)}
            </div>
          </div>
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

function getYouTubeId(url: string) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : '';
}

export default VideoPage;
