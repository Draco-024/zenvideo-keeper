
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Comment } from '@/types/video';
import { Input } from './ui/input';
import { AlertCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  youtubeUrl?: string;
}

export const CommentSection = ({ 
  videoId, 
  comments, 
  onAddComment,
  youtubeUrl
}: CommentSectionProps) => {
  const [commentText, setCommentText] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    onAddComment({ 
      text: commentText.trim(),
      username: username.trim() || 'Anonymous'
    });
    
    setCommentText('');
    setError('');
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
        {youtubeUrl && (
          <Button variant="outline" size="sm" asChild>
            <a 
              href={`${youtubeUrl}#comments`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on YouTube
            </a>
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Input
            placeholder="Your name (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              className={error ? "border-red-500" : ""}
              rows={3}
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            <Send className="h-4 w-4 mr-2" /> 
            Comment
          </Button>
        </div>
      </form>
      
      <div className="space-y-4 mt-6 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-lg bg-card border"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{comment.username || 'Anonymous'}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-line">{comment.text}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No comments yet. Be the first to comment!
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
