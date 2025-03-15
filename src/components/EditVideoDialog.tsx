
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Video, CategorySettings } from "../types/video";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { getCategories } from "@/utils/categoryUtils";
import { Pencil } from "lucide-react";
import { CategoryManagementDialog } from "./CategoryManagementDialog";

interface EditVideoDialogProps {
  open: boolean;
  onClose: () => void;
  video: Video;
  onEdit: (video: Video) => void;
}

export const EditVideoDialog = ({ open, onClose, video, onEdit }: EditVideoDialogProps) => {
  const [title, setTitle] = useState(video.title);
  const [url, setUrl] = useState(video.url);
  const [category, setCategory] = useState<string>(video.category);
  const [description, setDescription] = useState(video.description || "");
  const [categories, setCategories] = useState<CategorySettings[]>([]);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = () => {
    const loadedCategories = getCategories();
    setCategories([...loadedCategories].sort((a, b) => a.order - b.order));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit({ 
      ...video, 
      title, 
      url, 
      category,
      description: description.trim() ? description : undefined
    });
    onClose();
  };

  const handleCategoriesUpdated = () => {
    loadCategories();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Video</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCategoryManagementOpen(true)}
                className="ml-2"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Categories
              </Button>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Video URL
              </label>
              <Input
                id="url"
                placeholder="YouTube URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select value={category} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
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
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
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
