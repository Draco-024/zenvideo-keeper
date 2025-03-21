import { useState, useEffect } from 'react';
import { VideoGrid } from '../components/VideoGrid';
import { AddVideoDialog } from '../components/AddVideoDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, Category, SortOption, ViewMode } from '../types/video';
import { addVideo, getVideos, deleteVideo, updateVideo, importSampleVideos } from '../utils/storage';
import { Plus, Search, Grid, List, SlidersHorizontal, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ViewOptionsDialog } from '@/components/ViewOptionsDialog';
import { useNavigate } from 'react-router-dom';
import { ProfileDialog } from '@/components/ProfileDialog';

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setVideos(getVideos());
  }, []);

  // Track watched videos count for profile
  useEffect(() => {
    // Set initial profile stats if not already set
    if (!localStorage.getItem("videosWatched")) {
      localStorage.setItem("videosWatched", "0");
    }
    if (!localStorage.getItem("favoriteVideos")) {
      const favorites = videos.filter(v => v.favorite).length;
      localStorage.setItem("favoriteVideos", favorites.toString());
    }
    if (!localStorage.getItem("daysActive")) {
      localStorage.setItem("daysActive", "1");
    }
    if (!localStorage.getItem("accountLevel")) {
      localStorage.setItem("accountLevel", "Beginner");
    }
    if (!localStorage.getItem("username")) {
      localStorage.setItem("username", "User");
    }
  }, [videos]);

  useEffect(() => {
    // Import sample videos if there are none
    if (videos.length === 0) {
      importSampleVideos();
      setVideos(getVideos());
      toast({
        title: "Welcome to BankZen!",
        description: "Sample videos have been added to get you started.",
      });
    }
  }, [videos.length]);

  const handleAddVideo = (newVideo: Omit<Video, 'id' | 'createdAt'>) => {
    const video: Video = {
      ...newVideo,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    addVideo(video);
    setVideos(getVideos());
    toast({
      title: "Video Added",
      description: "Your video has been added successfully.",
    });
  };

  const handleDeleteVideo = (id: string) => {
    deleteVideo(id);
    setVideos(getVideos());
    toast({
      title: "Video Deleted",
      description: "Your video has been deleted.",
    });
  };

  const handleEditVideo = (video: Video) => {
    updateVideo(video);
    setVideos(getVideos());
    toast({
      title: "Video Updated",
      description: "Your video has been updated successfully.",
    });
  };

    // Add these required functions
    const handleToggleFavorite = (video: Video) => {
      const updatedVideo = { ...video, favorite: !video.favorite };
      updateVideo(updatedVideo);
      // You might want to update the local state as well
    };
  
    const handleViewVideo = (video: Video) => {
      // Navigate to video page or handle viewing
      console.log("Viewing video:", video.title);
      // You might want to update lastWatched timestamp
    };

  const filteredVideos = videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((video) =>
      selectedCategory === 'all' ? true : video.category === selectedCategory
    );

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return b.createdAt - a.createdAt;
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'lastWatched':
        return (b.lastWatched || 0) - (a.lastWatched || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        className="p-6 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <motion.h1 
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              BankZen
            </motion.h1>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsProfileDialogOpen(true)}
                className="rounded-full"
              >
                <UserRound className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsOptionsDialogOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setSelectedCategory(value as Category | 'all')}>
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
                  <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                  <TabsTrigger value="english">English</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-2 justify-end">
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
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center">
                      <span>Sort By</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                    <SelectItem value="lastWatched">Last Watched</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          {sortedVideos.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Add your first video to get started"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </div>
          ) : (
            <VideoGrid
              videos={videos}
              viewMode="grid" // Add a default viewMode
              onDelete={handleDeleteVideo}
              onEdit={handleEditVideo}
              onFavorite={handleToggleFavorite} // Add the missing required prop
              onView={handleViewVideo} // Add the missing required prop
            />
          )}
        </motion.div>
      </main>

      <AddVideoDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddVideo}
      />

      <ViewOptionsDialog
        open={isOptionsDialogOpen}
        onClose={() => setIsOptionsDialogOpen(false)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      
      <ProfileDialog
        open={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
