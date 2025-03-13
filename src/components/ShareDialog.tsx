
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Copy, Facebook, Link, Share2, Twitter } from "lucide-react";
import { useState } from "react";
import { Video, ShareOption } from "@/types/video";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-media-query";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  video: Video;
}

export const ShareDialog = ({ open, onClose, video }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleShare = async (option: ShareOption) => {
    const videoTitle = encodeURIComponent(video.title);
    const videoUrl = encodeURIComponent(video.url);
    
    // If Web Share API is available and the user is on mobile, use it
    if (isMobile && navigator.share && option === 'native') {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this video: ${video.title}`,
          url: video.url
        });
        
        toast({
          title: "Shared Successfully",
          description: "Video has been shared",
        });
        onClose();
        return;
      } catch (error) {
        console.error("Error sharing:", error);
        // Fall back to other sharing methods
      }
    }
    
    switch(option) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${videoTitle}%20-%20${videoUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${videoUrl}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${videoTitle}&url=${videoUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(video.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link Copied",
          description: "Video link has been copied to clipboard",
        });
        break;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium mb-2">Share "{video.title}"</h3>
          
          {isMobile && navigator.share && (
            <Button 
              variant="default" 
              className="flex items-center gap-2 w-full mb-4"
              onClick={() => handleShare('native')}
            >
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="font-medium">Share using device</span>
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto py-6"
              onClick={() => handleShare('whatsapp')}
            >
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 5A8.5 8.5 0 0 0 3 13.5a8.5 8.5 0 0 0 3.5 7L3 22l2.5-.5A8.5 8.5 0 0 0 17.5 5Z" />
                  <path d="M12 10v1m3-1v3-2.5M8.5 10v2.5a1.5 1.5 0 0 0 3 0" />
                </svg>
              </div>
              <span className="font-medium">WhatsApp</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto py-6"
              onClick={() => handleShare('facebook')}
            >
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium">Facebook</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto py-6"
              onClick={() => handleShare('twitter')}
            >
              <div className="h-10 w-10 rounded-full bg-blue-400 flex items-center justify-center">
                <Twitter className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium">Twitter</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-auto py-6"
              onClick={() => handleShare('copy')}
            >
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                {copied ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </motion.div>
                ) : (
                  <Copy className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="font-medium">{copied ? "Copied!" : "Copy Link"}</span>
            </Button>
          </div>
          
          <div className="pt-4">
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
