import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  padding = 'md',
  hover = false,
  className = '' 
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-100
      ${hover ? 'hover:shadow-lg hover:border-gray-200 transition-all duration-300' : ''}
      ${paddings[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
};