
import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`bg-gradient-to-br from-white via-qr-neutral to-qr-secondary/5 ${className}`}>
      {children}
    </div>
  );
};

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  type?: 'primary' | 'accent';
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = "",
  type = 'primary'
}) => {
  const gradientClass = type === 'primary' 
    ? 'text-gradient-primary' 
    : 'text-gradient-accent';
  
  return (
    <span className={`${gradientClass} ${className}`}>
      {children}
    </span>
  );
};

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = "",
  interactive = true,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft ${interactive ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = "",
  delay = 0
}) => {
  const delayStyle = { animationDelay: `${delay}s` };
  
  return (
    <div className={`animate-float ${className}`} style={delayStyle}>
      {children}
    </div>
  );
};

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`p-[2px] bg-gradient-to-r from-qr-primary to-qr-secondary rounded-xl ${className}`}>
      <div className="bg-white h-full w-full rounded-[calc(0.7rem-1px)]">
        {children}
      </div>
    </div>
  );
};
