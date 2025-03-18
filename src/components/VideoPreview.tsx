
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  file: File | null;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ file, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!file) {
      setThumbnail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Create a URL for the video file
    const videoUrl = URL.createObjectURL(file);
    
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      
      // When the video metadata is loaded, we can generate a thumbnail
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          // Seek to a point in the video (25% through)
          videoRef.current.currentTime = videoRef.current.duration * 0.25;
        }
      };
      
      // When the current frame is available after seeking
      videoRef.current.onseeked = () => {
        if (videoRef.current) {
          try {
            // Create a canvas to draw the video frame
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Draw the current video frame to the canvas
              ctx.drawImage(
                videoRef.current, 
                0, 0, 
                videoRef.current.videoWidth, 
                videoRef.current.videoHeight
              );
              
              // Convert the canvas to a data URL
              const dataUrl = canvas.toDataURL('image/jpeg');
              setThumbnail(dataUrl);
              setLoading(false);
            }
          } catch (error) {
            console.error('Error generating thumbnail:', error);
            setLoading(false);
          }
        }
      };
      
      // Handle errors
      videoRef.current.onerror = () => {
        console.error('Error loading video for thumbnail');
        setLoading(false);
      };
    }
    
    // Clean up the object URL when the component unmounts or when the file changes
    return () => {
      URL.revokeObjectURL(videoUrl);
    };
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <div className={cn(
      "overflow-hidden rounded-lg border border-border flex items-center justify-center bg-muted relative",
      className
    )}>
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin-slow w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : thumbnail ? (
        <div className="relative w-full h-full overflow-hidden">
          <img 
            src={thumbnail} 
            alt="Video preview" 
            className="w-full h-full object-contain animate-fade-in"
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
              {file.name}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground">
          Unable to generate preview
        </div>
      )}
      
      {/* Hidden video element for thumbnail generation */}
      <video ref={videoRef} className="hidden" muted />
    </div>
  );
};

export default VideoPreview;
