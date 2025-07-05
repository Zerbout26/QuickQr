import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  color?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  color = '#8b5cf6',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-3">
        <div className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full`}>
          <div 
            className="w-full h-full border-2 border-transparent rounded-full animate-spin" 
            style={{ 
              borderTopColor: color,
              animationDuration: '1.2s'
            }}
          ></div>
        </div>
      </div>
      {text && (
        <p className={`text-gray-600 font-medium ${textSizes[size]} mb-2`}>
          {text}
        </p>
      )}
      <div className="flex space-x-1 justify-center">
        <div 
          className="w-1 h-1 rounded-full animate-pulse" 
          style={{ 
            backgroundColor: color,
            opacity: 0.4,
            animationDelay: '0ms', 
            animationDuration: '1.5s' 
          }}
        ></div>
        <div 
          className="w-1 h-1 rounded-full animate-pulse" 
          style={{ 
            backgroundColor: color,
            opacity: 0.4,
            animationDelay: '200ms', 
            animationDuration: '1.5s' 
          }}
        ></div>
        <div 
          className="w-1 h-1 rounded-full animate-pulse" 
          style={{ 
            backgroundColor: color,
            opacity: 0.4,
            animationDelay: '400ms', 
            animationDuration: '1.5s' 
          }}
        ></div>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingProps> = (props) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
    <Loading {...props} />
  </div>
);

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-3 bg-gray-200 rounded"></div>
    </div>
  </div>
); 