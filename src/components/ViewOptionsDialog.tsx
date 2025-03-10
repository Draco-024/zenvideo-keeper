
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { SortOption, ViewMode } from "../types/video";
import { Grid, List, ArrowUpDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface ViewOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export const ViewOptionsDialog = ({
  open,
  onClose,
  viewMode,
  setViewMode,
  sortOption,
  setSortOption,
}: ViewOptionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Display Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">View Mode</h3>
            <div className="flex gap-4">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                className="flex-1 justify-start"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="mr-2 h-4 w-4" />
                Grid View
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                className="flex-1 justify-start"
                onClick={() => setViewMode("list")}
              >
                <List className="mr-2 h-4 w-4" />
                List View
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Sort By</h3>
            <RadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="newest" id="newest" />
                <Label htmlFor="newest">Newest First</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="oldest" id="oldest" />
                <Label htmlFor="oldest">Oldest First</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="alphabetical" id="alpha" />
                <Label htmlFor="alpha">Alphabetical (A-Z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lastWatched" id="watched" />
                <Label htmlFor="watched">Recently Watched</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <Button onClick={onClose} className="w-full">Done</Button>
      </DialogContent>
    </Dialog>
  );
};
