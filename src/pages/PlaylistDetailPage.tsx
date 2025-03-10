
import { useState, useEffect } from 'react';
import { VideoGrid } from '../components/VideoGrid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, ViewMode, Playlist } from '../types/video';
import { getPlaylistById, getVideosInPlaylist, deleteVideo, updateVideo } from '../utils/storage';
import { Search, Grid, List, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundPlaylist = getPlaylistById(id);
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        setVideos(getVideosInPlaylist(id));
      } else {
        toast({
          title: "Playlist Not Found",
          description: "The requested playlist could not be found.",
          variant: "destructive"
        });
        navigate('/playlists');
      }
    }
  }, [id, navigate]);

  const handleDeleteVideo = (videoId: string) => {
    deleteVideo(videoId);
    setVideos(getVideosInPlaylist(id || ''));
  };

  const handleEditVideo = (video: Video) => {
    updateVideo(video);
    setVideos(getVideosInPlaylist(id || ''));
  };

  const handleToggleFavorite = (video: Video) => {
    const updatedVideo = { ...video, favorite: !video.favorite };
    updateVideo(updatedVideo);
    setVideos(getVideosInPlaylist(id || ''));
  };

  const handleViewVideo = (video: Video) => {
    const updatedVideo = { ...video, lastWatched: Date.now() };
    updateVideo(updatedVideo);
    navigate(`/video/${video.id}`);
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        className="p-6 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/playlists')} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {playlist.name}
              </h1>
              <p className="text-muted-foreground">
                {playlist.videoIds.length} videos
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search in playlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {playlist.description && (
            <div className="bg-card p-4 rounded-lg mb-8 border">
              <h2 className="font-medium mb-2">Description</h2>
              <p className="text-muted-foreground">{playlist.description}</p>
            </div>
          )}
          
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search" : "This playlist is empty"}
              </p>
              <Button onClick={() => navigate('/home')}>
                Browse Videos
              </Button>
            </div>
          ) : (
            <VideoGrid
              videos={filteredVideos}
              viewMode={viewMode}
              onDelete={handleDeleteVideo}
              onEdit={handleEditVideo}
              onFavorite={handleToggleFavorite}
              onView={handleViewVideo}
            />
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PlaylistDetailPage;
