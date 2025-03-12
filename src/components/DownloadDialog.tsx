
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { DownloadCloud, Loader2, AlertCircle } from "lucide-react";
import { downloadYouTubeVideo, getPreferredDownloadFormat } from "@/utils/youtubeDownloader";
import { getYouTubeId } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";

interface DownloadDialogProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

export const DownloadDialog = ({ open, onClose, videoUrl, videoTitle }: DownloadDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadOptions, setDownloadOptions] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open && videoUrl) {
      fetchDownloadOptions();
    }
  }, [open, videoUrl]);
  
  const fetchDownloadOptions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await downloadYouTubeVideo(videoUrl);
      
      if (response.status === "success" && response.formats?.length) {
        setDownloadOptions(response.formats);
      } else {
        setError(response.error || "No download options available");
      }
    } catch (error) {
      setError("Failed to fetch download options");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (format: any) => {
    try {
      // Create a temporary anchor element to trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = format.url;
      downloadLink.download = `${videoTitle || 'video'}.mp4`;
      downloadLink.target = "_blank";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Download Started",
        description: "Your video download has started.",
      });
      
      onClose();
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error starting your download.",
        variant: "destructive",
      });
    }
  };
  
  const handleQuickDownload = () => {
    const bestFormat = getPreferredDownloadFormat(downloadOptions);
    if (bestFormat) {
      handleDownload(bestFormat);
    } else {
      toast({
        title: "Download Failed",
        description: "No suitable download format found.",
        variant: "destructive",
      });
    }
  };
  
  const getQualityLabel = (format: any) => {
    if (format.qualityLabel) {
      return format.qualityLabel;
    }
    if (format.audioQuality && !format.qualityLabel) {
      return "Audio only";
    }
    return "Unknown quality";
  };
  
  const getFormatSize = (format: any) => {
    if (format.size) {
      return format.size;
    }
    if (format.bitrate) {
      return `${Math.round(format.bitrate / 1000)} kbps`;
    }
    return "Unknown size";
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Video</DialogTitle>
        </DialogHeader>
        
        {videoUrl && getYouTubeId(videoUrl) && (
          <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
              title="YouTube video player"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        <div className="py-4">
          <h3 className="font-medium text-lg truncate">{videoTitle}</h3>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Fetching download options...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-muted-foreground text-sm mt-1">
              Try again later or use a different video
            </p>
          </div>
        ) : (
          <>
            <Button 
              className="w-full mb-4" 
              onClick={handleQuickDownload}
              disabled={downloadOptions.length === 0}
            >
              <DownloadCloud className="mr-2 h-4 w-4" />
              Quick Download (Best Quality)
            </Button>
            
            {downloadOptions.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <p className="text-sm font-medium mb-2">All Download Options:</p>
                {downloadOptions
                  .filter(format => format.url && (format.mimeType?.includes("video") || format.mimeType?.includes("audio")))
                  .slice(0, 8) // Limit to 8 options to prevent overwhelming UI
                  .map((format, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => handleDownload(format)}
                    >
                      <span>{getQualityLabel(format)}</span>
                      <span className="text-xs text-muted-foreground">{getFormatSize(format)}</span>
                    </Button>
                  ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
