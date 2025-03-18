
import React, { useCallback, useState } from 'react';
import { Upload, Check, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  className?: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  acceptedFileTypes = "video/mp4",
  maxSizeMB = 100,
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const validateFile = (file: File): boolean => {
    // Reset previous errors
    setError(null);
    
    // Check file type
    if (!file.type.match(acceptedFileTypes)) {
      setError(`Only ${acceptedFileTypes} files are supported`);
      return false;
    }
    
    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    
    return true;
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  }, [isDragActive]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);
  
  const clearError = () => setError(null);
  
  return (
    <div className={cn("w-full", className)}>
      {error && (
        <div className="mb-3 flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-2 rounded-lg animate-fade-in">
          <AlertCircle size={16} />
          <span className="flex-1 text-sm">{error}</span>
          <button 
            onClick={clearError}
            className="text-destructive/80 hover:text-destructive"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200",
          "flex flex-col items-center justify-center cursor-pointer",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-secondary",
          "animate-fade-in",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload video file"
        />
        
        <div className={cn(
          "w-14 h-14 mb-3 rounded-full flex items-center justify-center",
          isDragActive ? "bg-primary/20" : "bg-secondary"
        )}>
          <Upload className={cn(
            "w-6 h-6 transition-colors duration-200",
            isDragActive ? "text-primary animate-bounce-subtle" : "text-muted-foreground"
          )} />
        </div>
        
        <p className="text-sm font-medium mb-1">
          {isDragActive ? 'Drop your video here' : 'Upload video'}
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          Drag & drop or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          MP4 format, up to {maxSizeMB}MB
        </p>
      </div>
    </div>
  );
};

export default UploadZone;
