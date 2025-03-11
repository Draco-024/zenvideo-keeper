
import React from 'react';

interface VideoDescriptionProps {
  description: string;
}

export const VideoDescription = ({ description }: VideoDescriptionProps) => {
  // Function to format description with clickable links
  const formatDescription = (description: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the description by the URLs
    const parts = description.split(urlRegex);
    
    // Match all URLs in the description
    const urls = description.match(urlRegex) || [];
    
    // Combine parts and URLs
    const formattedParts = [];
    for (let i = 0; i < parts.length; i++) {
      formattedParts.push(parts[i]);
      if (i < urls.length) {
        formattedParts.push(
          <a 
            key={i} 
            href={urls[i]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {urls[i]}
          </a>
        );
      }
    }
    
    return formattedParts;
  };

  return (
    <div className="p-4 sm:p-6 rounded-lg bg-card mb-4 sm:mb-6 video-description">
      <h2 className="text-lg font-semibold mb-2 text-left">Description</h2>
      <div className="text-muted-foreground whitespace-pre-line text-left">
        {formatDescription(description)}
      </div>
    </div>
  );
};
