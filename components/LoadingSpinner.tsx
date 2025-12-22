import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-violet-500 animate-spin`} />
      {text && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
      )}
    </div>
  );
};

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '',
  lines = 1 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
};

