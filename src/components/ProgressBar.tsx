
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  className?: string;
  status?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = true,
  className,
  status,
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center">
        {status && (
          <div className="text-sm font-medium animate-fade-in">
            {status}
          </div>
        )}
        {showValue && (
          <div className="text-sm font-medium ml-auto">
            {percentage}%
          </div>
        )}
      </div>
      
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full bg-primary rounded-full transition-all duration-300 ease-out",
            percentage < 100 ? "progress-bar-shine" : ""
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
