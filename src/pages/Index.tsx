
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, Check, Download, ArrowRight, RefreshCw } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import VideoPreview from '@/components/VideoPreview';
import ProgressBar from '@/components/ProgressBar';
import { uploadVideo, getDownloadUrl } from '@/services/api';
import { cn } from '@/lib/utils';

// Processing states
enum ProcessingState {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

const Index: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setProcessingState(ProcessingState.IDLE);
    setErrorMessage(null);
    setDownloadUrl(null);
    
    toast({
      title: "Video Selected",
      description: file.name,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      // Reset state
      setErrorMessage(null);
      setProcessingState(ProcessingState.UPLOADING);
      setUploadProgress(0);
      
      // Upload the file
      const response = await uploadVideo(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      // Once upload is complete, switch to processing state
      setProcessingState(ProcessingState.PROCESSING);
      
      // Wait a moment to show processing state (simulating backend processing)
      setTimeout(() => {
        // Set download URL and mark as completed
        setDownloadUrl(response.download_url);
        setProcessingState(ProcessingState.COMPLETED);
        
        toast({
          title: "Processing Complete",
          description: "Your video has been processed successfully.",
          variant: "default",
        });
      }, 1000);
    } catch (error) {
      setProcessingState(ProcessingState.ERROR);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(message);
      
      toast({
        title: "Processing Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setProcessingState(ProcessingState.IDLE);
    setUploadProgress(0);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  // Helper function to determine if upload button should be disabled
  const isUploadDisabled = !selectedFile || 
    processingState === ProcessingState.UPLOADING || 
    processingState === ProcessingState.PROCESSING;

  // Status message based on current state
  const getStatusMessage = () => {
    switch (processingState) {
      case ProcessingState.UPLOADING:
        return "Uploading video...";
      case ProcessingState.PROCESSING:
        return "Processing video with AI detection...";
      case ProcessingState.COMPLETED:
        return "Processing complete!";
      case ProcessingState.ERROR:
        return errorMessage || "An error occurred";
      default:
        return selectedFile ? "Ready to upload" : "Select a video file";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-6 border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Vehicle Tracking System</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Detect loitering and repeated vehicle visits with AI
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Upload interface */}
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 rounded-xl space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Upload Video</h2>
                <p className="text-sm text-muted-foreground">
                  Select an MP4 video file to analyze for vehicle loitering and revisits
                </p>
              </div>
              
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-secondary rounded-lg">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button 
                      onClick={resetForm}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Remove file"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <UploadZone onFileSelect={handleFileSelect} className="h-40" />
              )}
              
              {/* Upload/Process Button */}
              {selectedFile && processingState !== ProcessingState.COMPLETED && (
                <button
                  onClick={handleUpload}
                  disabled={isUploadDisabled}
                  className={cn(
                    "button-primary w-full", 
                    processingState === ProcessingState.UPLOADING || 
                    processingState === ProcessingState.PROCESSING
                      ? "bg-primary/80"
                      : ""
                  )}
                >
                  {processingState === ProcessingState.UPLOADING || 
                   processingState === ProcessingState.PROCESSING ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {processingState === ProcessingState.UPLOADING ? 'Uploading...' : 'Processing...'}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Process Video
                    </span>
                  )}
                </button>
              )}
              
              {/* Download Button */}
              {processingState === ProcessingState.COMPLETED && downloadUrl && (
                <a
                  href={getDownloadUrl(downloadUrl)}
                  download
                  className="button-primary w-full inline-flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Processed Video
                </a>
              )}
            </div>
            
            {/* Processing Status */}
            {processingState !== ProcessingState.IDLE && (
              <div className={cn(
                "glass-card p-6 rounded-xl space-y-4 animate-fade-up",
                processingState === ProcessingState.ERROR ? "bg-destructive/10 border-destructive/20" : ""
              )}>
                <div>
                  <h3 className="text-sm font-medium mb-1">Status</h3>
                  <p className={cn(
                    "text-sm",
                    processingState === ProcessingState.ERROR ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {getStatusMessage()}
                  </p>
                </div>
                
                {processingState === ProcessingState.UPLOADING && (
                  <ProgressBar 
                    value={uploadProgress} 
                    status="Uploading video file" 
                  />
                )}
                
                {processingState === ProcessingState.PROCESSING && (
                  <ProgressBar 
                    value={100} 
                    status="AI processing in progress"
                  />
                )}
                
                {processingState === ProcessingState.COMPLETED && (
                  <div className="flex items-center gap-2 text-primary">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Ready for download</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right column - Video preview */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div>
                <h2 className="text-lg font-medium mb-2">Video Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Preview of the selected video file
                </p>
              </div>
              
              {selectedFile ? (
                <VideoPreview file={selectedFile} className="h-60 md:h-72" />
              ) : (
                <div className="h-60 md:h-72 border border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    No video selected
                  </p>
                </div>
              )}
            </div>
            
            {/* Info card */}
            <div className="glass-card p-6 rounded-xl space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div>
                <h2 className="text-lg font-medium mb-2">How It Works</h2>
                <p className="text-sm text-muted-foreground">
                  Our AI system analyzes video for suspicious vehicle patterns
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vehicle Detection</p>
                    <p className="text-xs text-muted-foreground">
                      YOLOv12n identifies vehicles in the video
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tracking</p>
                    <p className="text-xs text-muted-foreground">
                      DeepSORT tracks vehicles across frames
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pattern Analysis</p>
                    <p className="text-xs text-muted-foreground">
                      DBSCAN clustering identifies loitering & revisits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-border py-6 bg-secondary/50">
        <div className="container max-w-5xl mx-auto px-6">
          <p className="text-sm text-muted-foreground text-center">
            Vehicle Tracking System • AI-powered loitering and revisit detection
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
