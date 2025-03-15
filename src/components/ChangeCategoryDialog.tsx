
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Video, CategorySettings } from "@/types/video";
import { updateVideo } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { getCategories } from "@/utils/categoryUtils";
import { Pencil } from "lucide-react";
import { CategoryManagementDialog } from "./CategoryManagementDialog";

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
  const [selectedCategory, setSelectedCategory] = useState<string>(video.category);
  const [categories, setCategories] = useState<CategorySettings[]>([]);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = () => {
    const loadedCategories = getCategories();
    setCategories([...loadedCategories].sort((a, b) => a.order - b.order));
  };

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
    
    const categoryName = categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory;
    toast({
      title: "Category Changed",
      description: `Video moved to the ${categoryName} category.`
    });
    
    onClose();
  };

  const handleEditCategories = () => {
    setIsCategoryManagementOpen(true);
  };

  const handleCategoriesUpdated = () => {
    loadCategories();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Change Category</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditCategories}
                className="ml-2"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Categories
              </Button>
            </DialogTitle>
            <DialogDescription>
              Move this video to a different category.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup 
              value={selectedCategory} 
              onValueChange={(value) => setSelectedCategory(value)}
              className="space-y-3"
            >
              {categories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200"
                >
                  <RadioGroupItem value={category.id} id={category.id} />
                  <Label htmlFor={category.id} className="font-medium cursor-pointer flex-1">{category.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CategoryManagementDialog 
        open={isCategoryManagementOpen}
        onClose={() => setIsCategoryManagementOpen(false)}
        onCategoriesChange={handleCategoriesUpdated}
      />
    </>
  );
};
