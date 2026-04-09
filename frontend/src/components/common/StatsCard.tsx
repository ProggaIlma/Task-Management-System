import React from 'react';
import { Card } from './Card';

interface StatsCardProps {
  label: string;
  value: number;
  color?: 'gray' | 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  color = 'gray',
  icon,
  loading = false 
}) => {
  const colors = {
    gray: 'text-gray-900',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  const bgColors = {
    gray: 'bg-gray-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
  };

  if (loading) {
    return (
      <Card className={`${bgColors[color]} animate-pulse`}>
        <div className="p-4">
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${bgColors[color]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl md:text-3xl font-bold ${colors[color]}`}>
            {value}
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {label}
          </p>
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${bgColors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};