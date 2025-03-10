
import { useState, useEffect } from 'react';
import { VideoGrid } from '../components/VideoGrid';
import { AddVideoDialog } from '../components/AddVideoDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, Category } from '../types/video';
import { addVideo, getVideos, deleteVideo, updateVideo } from '../utils/storage';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setVideos(getVideos());
  }, []);

  const handleAddVideo = (newVideo: Omit<Video, 'id' | 'createdAt'>) => {
    const video: Video = {
      ...newVideo,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    addVideo(video);
    setVideos(getVideos());
  };

  const handleDeleteVideo = (id: string) => {
    deleteVideo(id);
    setVideos(getVideos());
  };

  const handleEditVideo = (video: Video) => {
    updateVideo(video);
    setVideos(getVideos());
  };

  const filteredVideos = videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((video) =>
      selectedCategory === 'all' ? true : video.category === selectedCategory
    );

  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        className="p-6 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">BankZen</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'aptitude', 'reasoning', 'english'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category as Category | 'all')}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-8">
        <VideoGrid
          videos={filteredVideos}
          onDelete={handleDeleteVideo}
          onEdit={handleEditVideo}
        />
      </main>

      <AddVideoDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddVideo}
      />
    </div>
  );
};

export default Index;
