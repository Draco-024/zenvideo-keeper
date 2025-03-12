
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Video, Playlist } from "@/types/video";
import { getPlaylists, addPlaylist, updatePlaylist } from "@/utils/storage";
import { ScrollArea } from "./ui/scroll-area";
import { Check, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  video: Video;
}

export const PlaylistDialog = ({ open, onClose, video }: PlaylistDialogProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setPlaylists(getPlaylists());
  }, []);

  const handleAddToPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    // Check if video is already in playlist
    if (playlist.videoIds.includes(video.id)) {
      toast({
        title: "Already in playlist",
        description: `This video is already in "${playlist.name}" playlist.`
      });
      return;
    }
    
    // Add video to playlist
    const updatedPlaylist = {
      ...playlist,
      videoIds: [...playlist.videoIds, video.id]
    };
    
    updatePlaylist(updatedPlaylist);
    setPlaylists(getPlaylists());
    
    toast({
      title: "Added to playlist",
      description: `Video added to "${playlist.name}" playlist.`
    });
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Please enter a name",
        description: "Playlist name cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim() || undefined,
      videoIds: [video.id],
      createdAt: Date.now()
    };
    
    addPlaylist(newPlaylist);
    setPlaylists(getPlaylists());
    setIsCreatingNew(false);
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    
    toast({
      title: "Playlist created",
      description: `Video added to "${newPlaylistName}" playlist.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        
        {!isCreatingNew ? (
          <>
            <ScrollArea className="max-h-[300px] px-1">
              {playlists.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No playlists yet. Create your first playlist.
                </p>
              ) : (
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => handleAddToPlaylist(playlist.id)}
                    >
                      <div>
                        <h4 className="font-medium">{playlist.name}</h4>
                        {playlist.description && (
                          <p className="text-sm text-muted-foreground">{playlist.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {playlist.videoIds.length} {playlist.videoIds.length === 1 ? 'video' : 'videos'}
                        </p>
                      </div>
                      
                      {playlist.videoIds.includes(video.id) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <Button className="w-full" onClick={() => setIsCreatingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Playlist
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="playlistName" className="text-sm font-medium">
                Playlist Name
              </label>
              <Input
                id="playlistName"
                placeholder="Enter a name for your playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="playlistDescription" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="playlistDescription"
                placeholder="Add a description for your playlist"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreatingNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist}>
                Create Playlist
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
