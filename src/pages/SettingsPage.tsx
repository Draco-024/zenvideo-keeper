
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Youtube, Upload, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAllVideos, getVideos } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [youtubePlaylistUrl, setYoutubePlaylistUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleImportYouTubePlaylist = () => {
    // This would typically connect to the YouTube API to fetch playlist videos
    setIsImporting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsImporting(false);
      toast({
        title: "Playlist Imported",
        description: "Your YouTube playlist videos have been imported successfully.",
      });
      setYoutubePlaylistUrl("");
    }, 1500);
  };

  const handleExportToYouTube = () => {
    // This would typically connect to the YouTube API to create a playlist
    setIsExporting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Exported to YouTube",
        description: "Your videos have been exported as a YouTube playlist.",
      });
    }, 1500);
  };

  const handleClearAll = () => {
    clearAllVideos();
    toast({
      title: "Library Cleared",
      description: "All videos have been removed from your library.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="max-w-3xl mx-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <div className="space-y-8">
          {/* YouTube Playlist Integration */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">YouTube Playlist</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Import from YouTube Playlist</h3>
                <p className="text-muted-foreground text-sm mb-3">Add videos from a YouTube playlist to your library</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="YouTube Playlist URL"
                    value={youtubePlaylistUrl}
                    onChange={(e) => setYoutubePlaylistUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleImportYouTubePlaylist} 
                    disabled={!youtubePlaylistUrl || isImporting}
                    className="min-w-20"
                  >
                    {isImporting ? (
                      <span className="animate-pulse">Importing...</span>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Enter a public YouTube playlist URL to import videos
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Export to YouTube Playlist</h3>
                <p className="text-muted-foreground text-sm mb-3">Create a YouTube playlist from your BankZen library</p>
                <Button 
                  variant="outline" 
                  onClick={handleExportToYouTube} 
                  disabled={getVideos().length === 0 || isExporting}
                >
                  {isExporting ? (
                    <span className="animate-pulse">Exporting...</span>
                  ) : (
                    <>
                      <Youtube className="mr-2 h-4 w-4" />
                      Export to YouTube
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  You'll need to sign in to your YouTube account to complete this action
                </p>
              </div>
            </div>
          </div>
          
          {/* Data Management Section */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div>
              <h3 className="font-medium mb-1">Clear Library</h3>
              <p className="text-muted-foreground text-sm mb-2">Remove all videos from your library</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Videos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all videos
                      from your library and reset your collection.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAll}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* About Section */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">About BankZen</h2>
            <p className="text-muted-foreground">
              BankZen is a premium video library app for banking exam preparation. All your data is stored locally on your device.
            </p>
            <p className="text-muted-foreground mt-2">
              Version 1.0.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
