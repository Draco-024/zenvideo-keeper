
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Settings, UserRound, Star, Trophy, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileDialog = ({ open, onClose }: ProfileDialogProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem("profileImage") || null
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );
  
  // Mock profile stats
  const stats = {
    videosWatched: localStorage.getItem("videosWatched") || "0",
    favoriteVideos: localStorage.getItem("favoriteVideos") || "0",
    daysActive: localStorage.getItem("daysActive") || "1",
    accountLevel: localStorage.getItem("accountLevel") || "Beginner"
  };

  const achievements = [
    { name: "First Video", earned: true, icon: <Star className="h-4 w-4 text-yellow-500" /> },
    { name: "Collection Started", earned: Number(stats.videosWatched) >= 5, icon: <Trophy className="h-4 w-4 text-blue-500" /> },
    { name: "Video Expert", earned: Number(stats.videosWatched) >= 10, icon: <Trophy className="h-4 w-4 text-purple-500" /> }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
        </DialogHeader>
        
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
          
          <div className="text-xl font-semibold">{username}</div>
          <Badge variant="secondary">{stats.accountLevel}</Badge>
          
          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.videosWatched}</div>
              <div className="text-sm text-muted-foreground">Videos Watched</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.favoriteVideos}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.daysActive}</div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">
                {achievements.filter(a => a.earned).length}/{achievements.length}
              </div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <h3 className="font-medium mb-2">Achievements</h3>
            <div className="space-y-2">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    achievement.earned ? "bg-muted" : "bg-muted/50 opacity-50"
                  }`}
                >
                  {achievement.icon}
                  <span>{achievement.name}</span>
                  {achievement.earned && (
                    <Badge variant="outline" className="ml-auto">Earned</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
