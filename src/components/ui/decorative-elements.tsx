
import React from 'react';

export const GridBackground: React.FC<{className?: string}> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
        style={{ 
          backgroundImage: `linear-gradient(to right, #6366F1 1px, transparent 1px), 
                            linear-gradient(to bottom, #6366F1 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }}
      />
    </div>
  );
};

export const BackgroundGlow: React.FC<{
  color?: string;
  className?: string;
  size?: string;
}> = ({ 
  color = 'rgba(99, 102, 241, 0.15)', 
  className = "",
  size = '40%'
}) => {
  return (
    <div className={`absolute -z-10 rounded-full filter blur-[100px] ${className}`}
      style={{ 
        background: color,
        width: size,
        height: size,
      }}>
    </div>
  );
};

export const CirclePattern: React.FC<{className?: string}> = ({ className = "" }) => {
  return (
    <div className={`absolute -z-10 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full border border-qr-primary/10"
          style={{ 
            width: `${(i + 1) * 100}px`, 
            height: `${(i + 1) * 100}px`,
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

export const DotsPattern: React.FC<{className?: string}> = ({ className = "" }) => {
  return (
    <div className={`absolute -z-10 ${className}`}>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-qr-primary/20"
          />
        ))}
      </div>
    </div>
  );
};
