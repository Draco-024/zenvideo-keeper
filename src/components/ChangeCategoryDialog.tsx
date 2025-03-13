
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Video, Category } from "@/types/video";
import { updateVideo } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useState } from "react";

interface ChangeCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  video: Video;
  onCategoryChange: (video: Video) => void;
}

export const ChangeCategoryDialog = ({ 
  open, 
  onClose, 
  video, 
  onCategoryChange 
}: ChangeCategoryDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(video.category);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (selectedCategory === video.category) {
      onClose();
      return;
    }

    const updatedVideo = {
      ...video,
      category: selectedCategory
    };

    updateVideo(updatedVideo);
    onCategoryChange(updatedVideo);
    
    toast({
      title: "Category Changed",
      description: `Video moved to the ${selectedCategory} category.`
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Category</DialogTitle>
          <DialogDescription>
            Move this video to a different category.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={selectedCategory} 
            onValueChange={(value) => setSelectedCategory(value as Category)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
              <RadioGroupItem value="aptitude" id="aptitude" />
              <Label htmlFor="aptitude" className="font-medium cursor-pointer flex-1">Aptitude</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
              <RadioGroupItem value="reasoning" id="reasoning" />
              <Label htmlFor="reasoning" className="font-medium cursor-pointer flex-1">Reasoning</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200">
              <RadioGroupItem value="english" id="english" />
              <Label htmlFor="english" className="font-medium cursor-pointer flex-1">English</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
