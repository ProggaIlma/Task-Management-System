import React from 'react';

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const StatusSelect: React.FC<StatusSelectProps> = ({ 
  value, 
  onChange, 
  options,
  disabled = false,
  size = 'md'
}) => {
  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:border-yellow-400',
      PROCESSING: 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400',
      DONE: 'border-green-300 bg-green-50 text-green-700 hover:border-green-400',
    };
    return styles[status] || 'border-gray-300 bg-white text-gray-700 hover:border-gray-400';
  };

  const sizes = {
    sm: 'pl-2 pr-6 py-1 text-xs',
    md: 'pl-3 pr-8 py-1.5 text-sm',
  };

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          appearance-none cursor-pointer
          border rounded-lg font-medium
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getStatusStyles(value)}
          ${sizes[size]}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.25rem center',
          backgroundSize: '1rem',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};