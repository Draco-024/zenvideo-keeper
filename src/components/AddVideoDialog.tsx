
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Video } from "../types/video";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AddVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (video: Omit<Video, 'id' | 'createdAt'>) => void;
}

export const AddVideoDialog = ({ open, onClose, onAdd }: AddVideoDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<"aptitude" | "reasoning" | "english">("aptitude");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, url, category });
    setTitle("");
    setUrl("");
    setCategory("aptitude");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder="Video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Select value={category} onValueChange={(value: any) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aptitude">Aptitude</SelectItem>
              <SelectItem value="reasoning">Reasoning</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Video</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
