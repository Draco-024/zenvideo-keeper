
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { LogOut, Home, Bookmark, List, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileDialog = ({ open, onClose }: ProfileDialogProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("profileImage") || null
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (newUsername: string) => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      localStorage.setItem("username", newUsername);
      setIsEditingUsername(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const content = (
    <ScrollArea className="h-[80vh] px-2">
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="h-24 w-24 cursor-pointer" onClick={() => document.getElementById('avatarUpload')?.click()}>
          <AvatarImage src={profileImage || undefined} alt={username} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <input 
          type="file" 
          id="avatarUpload" 
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                setProfileImage(result);
                localStorage.setItem("profileImage", result);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        
        {isEditingUsername ? (
          <div className="flex items-center gap-2">
            <Input
              defaultValue={username}
              autoFocus
              onBlur={(e) => handleUsernameChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUsernameChange((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setIsEditingUsername(true)}>
            {username}
          </Button>
        )}
      </div>
      
      <div className="flex flex-col gap-2 mt-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate('/home')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate('/favorites')}>
          <Bookmark className="mr-2 h-4 w-4" />
          Favorites
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate('/playlists')}>
          <List className="mr-2 h-4 w-4" />
          Playlists
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button variant="outline" className="w-full justify-start text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
          <SheetHeader className="text-left">
            <SheetTitle>Your Profile</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
