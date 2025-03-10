
import { Video } from '../types/video';
import { Card } from './ui/card';
import { motion } from 'framer-motion';

interface VideoGridProps {
  videos: Video[];
  onDelete: (id: string) => void;
  onEdit: (video: Video) => void;
}

export const VideoGrid = ({ videos, onDelete, onEdit }: VideoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}
                title={video.title}
                className="absolute w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                  {video.category}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => onEdit(video)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(video.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

function getYouTubeId(url: string) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : '';
}
