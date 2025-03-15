
import { useState, useEffect } from 'react';
import { VideoGrid } from '../components/VideoGrid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, ViewMode } from '../types/video';
import { getVideos, deleteVideo, updateVideo } from '../utils/storage';
import { Search, Grid, List, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const allVideos = getVideos();
    const favoriteVideos = allVideos.filter(video => video.favorite);
    setVideos(favoriteVideos);
  }, []);

  const handleDeleteVideo = (id: string) => {
    deleteVideo(id);
    const allVideos = getVideos();
    const favoriteVideos = allVideos.filter(video => video.favorite);
    setVideos(favoriteVideos);
  };

  const handleEditVideo = (video: Video) => {
    updateVideo(video);
    const allVideos = getVideos();
    const favoriteVideos = allVideos.filter(video => video.favorite);
    setVideos(favoriteVideos);
  };

  const handleToggleFavorite = (video: Video) => {
    const updatedVideo = { ...video, favorite: !video.favorite };
    updateVideo(updatedVideo);
    const allVideos = getVideos();
    const favoriteVideos = allVideos.filter(video => video.favorite);
    setVideos(favoriteVideos);
  };

  const handleViewVideo = (video: Video) => {
    const updatedVideo = { ...video, lastWatched: Date.now() };
    updateVideo(updatedVideo);
    navigate(`/video/${video.id}`);
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-600">
              Favorites
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search in favorites..."
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
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No favorites found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search" : "Add videos to your favorites to see them here"}
              </p>
              <Button onClick={() => navigate('/')}>
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

export default FavoritesPage;
