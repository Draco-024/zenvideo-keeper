
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { DownloadCloud, Loader2, AlertCircle, Music, Video, RefreshCw } from "lucide-react";
import { downloadYouTubeVideo, getPreferredDownloadFormat } from "@/utils/youtubeDownloader";
import { downloadYouTubeVideoAlternate, getAlternatePreferredFormat } from "@/utils/alternateYoutubeDownloader";
import { getYouTubeId } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DownloadDialogProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

// New YouTube MP3 API
const downloadYouTubeMP3 = async (url: string) => {
  const videoId = getYouTubeId(url);
  if (!videoId) return { status: "error", error: "Invalid YouTube URL" };
  
  try {
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
        'x-rapidapi-key': '469d65be43mshd338ce4bf882d0ap1b6664jsneb8014d73e4a'
      }
    };
    
    const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, options);
    const data = await response.json();
    
    if (data.status === "ok" && data.link) {
      return {
        status: "success",
        formats: [
          {
            url: data.link,
            mimeType: "audio/mp3",
            quality: "MP3 Audio",
            size: data.size || "Unknown size",
            audioQuality: "MP3",
            container: "mp3"
          }
        ]
      };
    } else {
      return { status: "error", error: data.msg || "Failed to get MP3 download link" };
    }
  } catch (error) {
    console.error("MP3 download error:", error);
    return { status: "error", error: "Failed to connect to MP3 download service" };
  }
};

// Get preferred format from MP3 API
const getMP3PreferredFormat = (formats: any[]) => {
  if (!formats || formats.length === 0) return null;
  return formats[0]; // MP3 API returns just one format
};

export const DownloadDialog = ({ open, onClose, videoUrl, videoTitle }: DownloadDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadOptions, setDownloadOptions] = useState<any[]>([]);
  const [alternateOptions, setAlternateOptions] = useState<any[]>([]);
  const [mp3Options, setMP3Options] = useState<any[]>([]);
  const [activeApi, setActiveApi] = useState<'primary' | 'alternate' | 'mp3'>('primary');
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
      // Fetch from all APIs in parallel
      const [primaryResponse, alternateResponse, mp3Response] = await Promise.all([
        downloadYouTubeVideo(videoUrl),
        downloadYouTubeVideoAlternate(videoUrl),
        downloadYouTubeMP3(videoUrl)
      ]);
      
      if (primaryResponse.status === "success" && primaryResponse.formats?.length) {
        setDownloadOptions(primaryResponse.formats);
      }
      
      if (alternateResponse.status === "success" && alternateResponse.formats?.length) {
        setAlternateOptions(alternateResponse.formats);
      }
      
      if (mp3Response.status === "success" && mp3Response.formats?.length) {
        setMP3Options(mp3Response.formats);
      }
      
      // Set error only if all APIs fail
      if (primaryResponse.status !== "success" && 
          alternateResponse.status !== "success" && 
          mp3Response.status !== "success") {
        setError(primaryResponse.error || alternateResponse.error || mp3Response.error || "No download options available");
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
      
      // Set appropriate file extension based on the API
      let extension = '.mp4';
      if (activeApi === 'mp3') {
        extension = '.mp3';
      }
      
      downloadLink.download = `${videoTitle || 'video'}${extension}`;
      downloadLink.target = "_blank";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Download Started",
        description: "Your download has started.",
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
    let format = null;
    
    switch (activeApi) {
      case 'primary':
        format = getPreferredDownloadFormat(downloadOptions);
        break;
      case 'alternate':
        format = getAlternatePreferredFormat(alternateOptions);
        break;
      case 'mp3':
        format = getMP3PreferredFormat(mp3Options);
        break;
    }
      
    if (format) {
      handleDownload(format);
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
    if (format.quality) {
      return format.quality;
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Download Video</DialogTitle>
          <DialogDescription>
            Choose from multiple APIs to download this video
          </DialogDescription>
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
        
        <div className="py-2">
          <h3 className="font-medium text-lg truncate mb-2">{videoTitle}</h3>
          
          <Tabs value={activeApi} onValueChange={(value) => setActiveApi(value as 'primary' | 'alternate' | 'mp3')}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="primary">
                <Video className="mr-2 h-4 w-4" />
                Video API
              </TabsTrigger>
              <TabsTrigger value="alternate">
                <Video className="mr-2 h-4 w-4" />
                Alt Video
              </TabsTrigger>
              <TabsTrigger value="mp3">
                <Music className="mr-2 h-4 w-4" />
                MP3 Audio
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="primary">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-muted-foreground">Fetching download options...</p>
                </div>
              ) : error && downloadOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try another API instead
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
            </TabsContent>
            
            <TabsContent value="alternate">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-muted-foreground">Fetching download options...</p>
                </div>
              ) : error && alternateOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try another API instead
                  </p>
                </div>
              ) : (
                <>
                  <Button 
                    className="w-full mb-4" 
                    onClick={handleQuickDownload}
                    disabled={alternateOptions.length === 0}
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Quick Download (Best Quality)
                  </Button>
                  
                  {alternateOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Available Options:</p>
                      {alternateOptions.map((format, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          className="w-full justify-between"
                          onClick={() => handleDownload(format)}
                        >
                          <span>{format.quality || "Unknown quality"}</span>
                          <span className="text-xs text-muted-foreground">{format.size || "Unknown size"}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="mp3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-muted-foreground">Fetching MP3 download options...</p>
                </div>
              ) : error && mp3Options.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try one of the video APIs instead
                  </p>
                </div>
              ) : (
                <>
                  <Button 
                    className="w-full mb-4" 
                    onClick={handleQuickDownload}
                    disabled={mp3Options.length === 0}
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Download MP3 Audio
                  </Button>
                  
                  {mp3Options.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">MP3 Audio:</p>
                      {mp3Options.map((format, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          className="w-full justify-between"
                          onClick={() => handleDownload(format)}
                        >
                          <span>{format.quality || "MP3 Audio"}</span>
                          <span className="text-xs text-muted-foreground">{format.size || "Unknown size"}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full" 
            onClick={fetchDownloadOptions}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Download Options
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
