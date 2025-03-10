
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Video } from "../types/video";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { motion } from "framer-motion";
import { getYouTubeId } from "@/utils/helpers";
import { AlertCircle, ExternalLink } from "lucide-react";
import { isGooglePhotosUrl, getVideoType } from "@/utils/storage";

interface AddVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (video: Omit<Video, 'id' | 'createdAt'>) => void;
}

export const AddVideoDialog = ({ open, onClose, onAdd }: AddVideoDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<"aptitude" | "reasoning" | "english">("aptitude");
  const [description, setDescription] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const validateUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url) || isGooglePhotosUrl(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setIsValidUrl(newUrl === "" || validateUrl(newUrl));
  };

  const handleNextStep = () => {
    if (url && title && isValidUrl) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidUrl) return;
    
    const videoType = getVideoType(url);
    const thumbnailUrl = videoType === 'youtube'
      ? `https://img.youtube.com/vi/${getYouTubeId(url)}/mqdefault.jpg`
      : undefined;
    
    onAdd({ 
      title, 
      url, 
      category,
      description: description.trim() ? description : undefined,
      thumbnail: thumbnailUrl,
      favorite: false,
      videoType: videoType,
      comments: []
    });
    
    // Reset form
    setTitle("");
    setUrl("");
    setCategory("aptitude");
    setDescription("");
    setCurrentStep(1);
    onClose();
  };

  const resetAndClose = () => {
    setTitle("");
    setUrl("");
    setCategory("aptitude");
    setDescription("");
    setCurrentStep(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Video</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="relative overflow-hidden" style={{ height: currentStep === 1 ? 'auto' : '0', opacity: currentStep === 1 ? 1 : 0 }}>
            <motion.div
              initial={{ x: currentStep === 1 ? 100 : 0 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium">
                    Video URL
                  </label>
                  <Input
                    id="url"
                    placeholder="YouTube or Google Photos URL"
                    value={url}
                    onChange={handleUrlChange}
                    required
                    className={!isValidUrl ? "border-red-500" : ""}
                  />
                  {!isValidUrl && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Please enter a valid YouTube or Google Photos URL
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Video Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                {url && isValidUrl && !isGooglePhotosUrl(url) && getYouTubeId(url) && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Preview</p>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> Open in YouTube
                        </a>
                      </Button>
                    </div>
                    <div className="aspect-video rounded-md overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(url)}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                )}
                
                {url && isValidUrl && isGooglePhotosUrl(url) && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Google Photos Link</p>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> Open in Google Photos
                        </a>
                      </Button>
                    </div>
                    <div className="p-4 rounded-md bg-card border flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M8 2v20" />
                        <path d="M16 2v20" />
                        <path d="M2 8h20" />
                        <path d="M2 16h20" />
                      </svg>
                      <span>Google Photos collection will be added</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={resetAndClose} type="button">
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={!url || !title || !isValidUrl}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="relative overflow-hidden" style={{ height: currentStep === 2 ? 'auto' : '0', opacity: currentStep === 2 ? 1 : 0 }}>
            <motion.div
              initial={{ x: currentStep === 2 ? 100 : 0 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aptitude">Aptitude</SelectItem>
                      <SelectItem value="reasoning">Reasoning</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Add a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-between space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)} 
                    type="button"
                  >
                    Back
                  </Button>
                  <Button type="submit">Add Video</Button>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
