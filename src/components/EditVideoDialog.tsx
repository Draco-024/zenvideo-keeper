
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Video } from "../types/video";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface EditVideoDialogProps {
  open: boolean;
  onClose: () => void;
  video: Video;
  onEdit: (video: Video) => void;
}

export const EditVideoDialog = ({ open, onClose, video, onEdit }: EditVideoDialogProps) => {
  const [title, setTitle] = useState(video.title);
  const [url, setUrl] = useState(video.url);
  const [category, setCategory] = useState<"aptitude" | "reasoning" | "english">(video.category);
  const [description, setDescription] = useState(video.description || "");

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
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
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
