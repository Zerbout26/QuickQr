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
  color = '#6b7280',
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
        {/* Soft background circle */}
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center`}>
          {/* Main spinner with softer colors */}
          <div className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full relative`}>
            <div 
              className="w-full h-full border-2 border-transparent rounded-full animate-spin" 
              style={{ 
                borderTopColor: color,
                borderRightColor: `${color}40`,
                borderBottomColor: `${color}20`,
                borderLeftColor: `${color}10`,
                animationDuration: '1.5s',
                animationTimingFunction: 'ease-in-out'
              }}
            ></div>
          </div>
        </div>
      </div>
      {text && (
        <p className={`text-gray-500 font-normal ${textSizes[size]} mb-2`}>
          {text}
        </p>
      )}
      {/* Softer pulsing dots */}
      <div className="flex space-x-1.5 justify-center">
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse bg-gray-300" 
          style={{ 
            animationDelay: '0ms', 
            animationDuration: '2s' 
          }}
        ></div>
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse bg-gray-300" 
          style={{ 
            animationDelay: '300ms', 
            animationDuration: '2s' 
          }}
        ></div>
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse bg-gray-300" 
          style={{ 
            animationDelay: '600ms', 
            animationDuration: '2s' 
          }}
        ></div>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingProps> = (props) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50/80 to-white/90 backdrop-blur-sm">
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