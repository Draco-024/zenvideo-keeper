
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAllVideos, exportVideosToJson, importVideosFromJson, getVideos } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [importError, setImportError] = useState<string | null>(null);
  
  // Preferences (these would typically be stored in localStorage or similar)
  const [autoPlay, setAutoPlay] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  const handleExport = () => {
    try {
      exportVideosToJson();
      toast({
        title: "Export Successful",
        description: "Your videos have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your videos.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const success = importVideosFromJson(result);
          if (success) {
            toast({
              title: "Import Successful",
              description: `${getVideos().length} videos have been imported.`,
            });
          } else {
            setImportError("Invalid file format. Please select a valid BankZen export file.");
            toast({
              title: "Import Failed",
              description: "The selected file has an invalid format.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        setImportError("Error reading file. Please try again.");
        toast({
          title: "Import Failed",
          description: "There was an error importing your videos.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleClearAll = () => {
    clearAllVideos();
    toast({
      title: "Library Cleared",
      description: "All videos have been removed from your library.",
    });
  };

  const handleSavePreferences = () => {
    // In a real app, we would save these to localStorage or similar
    localStorage.setItem('bankzen_preferences', JSON.stringify({
      autoPlay,
      showDescription,
      enableAnimations
    }));
    
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been saved.",
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
          {/* Preferences Section */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoplay" className="font-medium">Autoplay Videos</Label>
                  <p className="text-muted-foreground text-sm">Start playing videos automatically</p>
                </div>
                <Switch 
                  id="autoplay" 
                  checked={autoPlay} 
                  onCheckedChange={setAutoPlay} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="descriptions" className="font-medium">Show Descriptions</Label>
                  <p className="text-muted-foreground text-sm">Display video descriptions in the library</p>
                </div>
                <Switch 
                  id="descriptions" 
                  checked={showDescription} 
                  onCheckedChange={setShowDescription} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations" className="font-medium">Enable Animations</Label>
                  <p className="text-muted-foreground text-sm">Enable UI animations throughout the app</p>
                </div>
                <Switch 
                  id="animations" 
                  checked={enableAnimations} 
                  onCheckedChange={setEnableAnimations} 
                />
              </div>
            </div>
            
            <Button onClick={handleSavePreferences} className="mt-6">
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
          
          {/* Data Management Section */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Export Videos</h3>
                <p className="text-muted-foreground text-sm mb-2">Download all your videos as a JSON file</p>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Library
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Import Videos</h3>
                <p className="text-muted-foreground text-sm mb-2">Import videos from a previously exported file</p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Library
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                  />
                </div>
                {importError && (
                  <p className="text-red-500 text-sm mt-2">{importError}</p>
                )}
              </div>
              
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
