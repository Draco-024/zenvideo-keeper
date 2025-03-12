
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, Search, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { downloadYouTubeVideo, getPreferredDownloadFormat } from '@/utils/youtubeDownloader';
import { useToast } from '@/hooks/use-toast';
import { getYouTubeId } from '@/utils/helpers';

const DownloadPage = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setVideoInfo(null);
    setDownloadSuccess(false);

    try {
      const response = await downloadYouTubeVideo(url);
      
      if (response.status === "success" && response.formats?.length) {
        setVideoInfo(response);
      } else {
        setError(response.error || "No download options available");
      }
    } catch (error) {
      setError("Failed to fetch video information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: any = null) => {
    if (!videoInfo) return;

    const downloadFormat = format || getPreferredDownloadFormat(videoInfo.formats);
    if (!downloadFormat) {
      toast({
        title: "Download Failed",
        description: "No suitable download format found.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloading(true);
      // Create a temporary anchor element to trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadFormat.url;
      downloadLink.download = `${videoInfo.title || 'video'}.mp4`;
      downloadLink.target = "_blank";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setDownloadSuccess(true);
      toast({
        title: "Download Started",
        description: "Your video download has started.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error starting your download.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2 rounded-full" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Download YouTube Videos</h1>
        </div>
        
        <Card className="p-6 mb-8 border rounded-xl">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-10 rounded-full w-full"
                  placeholder="Enter YouTube video URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="rounded-full" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </form>
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Fetching video information...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}
          
          {videoInfo && (
            <div className="mt-4">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/3 aspect-video bg-black rounded-lg overflow-hidden">
                  {getYouTubeId(url) && (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(url)}`}
                      title="YouTube video preview"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      onClick={() => handleDownload()}
                      disabled={isDownloading}
                      className="rounded-full"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : downloadSuccess ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download Best Quality
                    </Button>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">All Available Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {videoInfo.formats
                  .filter((format: any) => format.url && (format.mimeType?.includes("video") || format.mimeType?.includes("audio")))
                  .map((format: any, index: number) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="justify-between rounded-full"
                      onClick={() => handleDownload(format)}
                    >
                      <span className="truncate">
                        {format.qualityLabel || format.audioQuality || 'Unknown quality'}
                        {format.mimeType && ` (${format.mimeType.split(';')[0].split('/')[1]})`}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format.contentLength ? formatFileSize(parseInt(format.contentLength)) : 'Unknown size'}
                      </span>
                    </Button>
                  ))}
              </div>
            </div>
          )}
          
          {!isLoading && !error && !videoInfo && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Enter a YouTube URL to get started</h3>
              <p className="text-muted-foreground mb-4">
                Paste a YouTube video URL above and click Search to see available download options.
              </p>
              <p className="text-sm text-muted-foreground">
                Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </p>
            </div>
          )}
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>This tool allows you to download YouTube videos for educational purposes only.</p>
          <p className="mt-1">Please respect copyright laws and the content creator's rights.</p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
