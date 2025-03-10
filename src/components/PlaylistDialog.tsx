
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { Playlist, Video } from "@/types/video";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Check, Plus, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPlaylists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from "@/utils/storage";

interface PlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  video: Video;
}

export const PlaylistDialog = ({ open, onClose, video }: PlaylistDialogProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getPlaylists());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const { toast } = useToast();

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim() || undefined,
      videoIds: [video.id],
      createdAt: Date.now()
    };
    
    createPlaylist(newPlaylist);
    setPlaylists(getPlaylists());
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setShowCreateForm(false);
    
    toast({
      title: "Playlist Created",
      description: `"${newPlaylist.name}" has been created and video added.`,
    });
  };

  const handleToggleVideoInPlaylist = (playlist: Playlist) => {
    const isInPlaylist = playlist.videoIds.includes(video.id);
    
    if (isInPlaylist) {
      removeVideoFromPlaylist(playlist.id, video.id);
      toast({
        title: "Video Removed",
        description: `Video removed from "${playlist.name}" playlist.`,
      });
    } else {
      addVideoToPlaylist(playlist.id, video.id);
      toast({
        title: "Video Added",
        description: `Video added to "${playlist.name}" playlist.`,
      });
    }
    
    setPlaylists(getPlaylists());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save to Playlist</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {!showCreateForm ? (
            <>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {playlists.length > 0 ? (
                  playlists.map((playlist) => {
                    const isInPlaylist = playlist.videoIds.includes(video.id);
                    return (
                      <div
                        key={playlist.id}
                        className={`p-3 rounded-md border ${isInPlaylist ? 'border-primary' : 'border-border'} flex justify-between items-center cursor-pointer hover:bg-accent transition-colors`}
                        onClick={() => handleToggleVideoInPlaylist(playlist)}
                      >
                        <div>
                          <h3 className="font-medium">{playlist.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {playlist.videoIds.length} {playlist.videoIds.length === 1 ? 'video' : 'videos'}
                          </p>
                        </div>
                        <div className={`h-6 w-6 rounded-full ${isInPlaylist ? 'bg-primary' : 'bg-accent'} flex items-center justify-center`}>
                          {isInPlaylist && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No playlists yet. Create your first playlist!
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowCreateForm(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Playlist
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="playlist-name" className="text-sm font-medium">
                  Playlist Name
                </label>
                <Input
                  id="playlist-name"
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus
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
              
              <div className="flex gap-2 justify-end pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
