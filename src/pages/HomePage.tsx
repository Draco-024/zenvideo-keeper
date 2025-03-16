import { useState, useEffect } from 'react';
import { VideoGrid } from '../components/VideoGrid';
import { AddVideoDialog } from '../components/AddVideoDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, Category, SortOption, ViewMode } from '../types/video';
import { addVideo, getVideos, deleteVideo, updateVideo, importSampleVideos, forceRefreshVideos } from '../utils/storage';
import { Plus, Search, Settings, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../components/ui/select';
import { ViewOptionsDialog } from '@/components/ViewOptionsDialog';
import { useNavigate } from 'react-router-dom';
import { ProfileDialog } from '@/components/ProfileDialog';
import { CategoryManagementDialog } from '@/components/CategoryManagementDialog';
import { getCategories } from '@/utils/categoryUtils';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AppNavBar } from '@/components/AppNavBar';

const HomePage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all' | 'photos'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [categories, setCategories] = useState(getCategories());
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [videoGridColumns, setVideoGridColumns] = useState(4);
  
  useEffect(() => {
    forceRefreshVideos();
    setVideos(getVideos());
    
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setVideoGridColumns(4);
      } else if (window.innerWidth >= 768) {
        setVideoGridColumns(3);
      } else if (window.innerWidth >= 640) {
        setVideoGridColumns(2);
      } else {
        setVideoGridColumns(1);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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

  const handleToggleFavorite = (video: Video) => {
    const updatedVideo = { ...video, favorite: !video.favorite };
    updateVideo(updatedVideo);
    setVideos(getVideos());
    
    const favorites = getVideos().filter(v => v.favorite).length;
    localStorage.setItem("favoriteVideos", favorites.toString());
  };

  const handleViewVideo = (video: Video) => {
    const updatedVideo = { ...video, lastWatched: Date.now() };
    updateVideo(updatedVideo);
    
    const watched = parseInt(localStorage.getItem("videosWatched") || "0") + 1;
    localStorage.setItem("videosWatched", watched.toString());
    
    if (watched >= 20) {
      localStorage.setItem("accountLevel", "Expert");
    } else if (watched >= 10) {
      localStorage.setItem("accountLevel", "Advanced");
    } else if (watched >= 5) {
      localStorage.setItem("accountLevel", "Intermediate");
    }
    
    navigate(`/video/${video.id}`);
  };

  const refreshCategories = () => {
    setCategories(getCategories());
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const handleReorderVideos = (reorderedVideos: Video[]) => {
    console.log("Reordered videos:", reorderedVideos);
    setVideos(reorderedVideos);
  };

  const filteredVideos = videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((video) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'photos') return video.videoType === 'googlephotos';
      return video.category === selectedCategory;
    });

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

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { duration: 0.3 } },
    out: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-20"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <motion.header 
        className="p-4 md:p-6 border-b bg-gradient-to-r from-background to-muted/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
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
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  setIsCategoryManagementOpen(true);
                }}
                className="rounded-full"
                title="Edit Categories"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10 rounded-full"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-1">
                  <CarouselItem className="pl-1 basis-auto">
                    <Button 
                      onClick={() => setSelectedCategory('all')} 
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      className="rounded-full"
                    >
                      All
                    </Button>
                  </CarouselItem>
                  
                  {categories.map((category) => (
                    <CarouselItem key={category.id} className="pl-1 basis-auto">
                      <Button 
                        onClick={() => setSelectedCategory(category.id)} 
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        className="rounded-full"
                      >
                        {category.name}
                      </Button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            <div className="flex justify-end">
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[140px] rounded-full">
                  <div className="flex items-center">
                    <span>Sort By</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="lastWatched">Last Watched</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-xl shadow-sm p-4"
        >
          {sortedVideos.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <h3 className="text-xl font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Add your first video to get started"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </div>
          ) : (
            <VideoGrid
              videos={sortedVideos}
              viewMode={viewMode}
              onDelete={handleDeleteVideo}
              onEdit={handleEditVideo}
              onFavorite={handleToggleFavorite}
              onView={handleViewVideo}
              showBannerInListView={false}
              columns={videoGridColumns}
              enableDragAndDrop={viewMode === 'list'}
              onReorder={handleReorderVideos}
            />
          )}
        </motion.div>
      </main>

      <AppNavBar 
        onAddVideo={() => setIsAddDialogOpen(true)}
        onViewModeChange={handleViewModeChange}
        currentViewMode={viewMode}
      />

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
      
      <CategoryManagementDialog
        open={isCategoryManagementOpen}
        onClose={() => setIsCategoryManagementOpen(false)}
        onCategoriesChange={refreshCategories}
      />
    </motion.div>
  );
};

export default HomePage;
