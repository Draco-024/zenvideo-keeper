
import { useState, useEffect } from 'react';
import { VideoGrid } from '../components/VideoGrid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, ViewMode, Playlist } from '../types/video';
import { getPlaylists, getVideoById, deleteVideo, updateVideo, getVideosInPlaylist, deletePlaylist, updatePlaylist } from '../utils/storage';
import { Search, Grid, List, ArrowLeft, Edit, Trash, PlayCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    setPlaylists(getPlaylists());
  }, []);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim() || undefined,
      videoIds: [],
      createdAt: Date.now()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    localStorage.setItem('bankzen_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Playlist Created",
      description: `"${newPlaylistName}" playlist has been created.`,
    });
  };

  const handleDeletePlaylist = (id: string) => {
    deletePlaylist(id);
    setPlaylists(getPlaylists());
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been deleted.",
    });
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button variant="ghost" onClick={() => navigate('/home')} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
              My Playlists
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredPlaylists.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No playlists found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search" : "Create your first playlist to get started"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg mb-1">{playlist.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(playlist.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {playlist.description || "No description"}
                      </p>
                      
                      <p className="text-sm mb-4">
                        <strong>{playlist.videoIds.length}</strong> videos
                      </p>
                      
                      <div className="mt-auto flex justify-between">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="flex-1 mr-2"
                          onClick={() => navigate(`/playlist/${playlist.id}`)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              // Would add edit functionality here
                              toast({
                                title: "Coming Soon",
                                description: "Playlist editing will be available soon.",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePlaylist(playlist.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label htmlFor="playlist-name" className="text-sm font-medium">
                Playlist Name
              </label>
              <Input
                id="playlist-name"
                placeholder="Enter playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="playlist-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="playlist-description"
                placeholder="Enter description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaylistsPage;
