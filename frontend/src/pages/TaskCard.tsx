import React from 'react';
import { Card } from '@common/Card';
import { Button } from '@common/Button';

interface TaskCardProps {
  task: { id: string; title: string; description: string; status: 'PENDING' | 'PROCESSING' | 'DONE'; assignedUser?: { name: string } };
  onStatusChange: (id: string, status: 'PENDING' | 'PROCESSING' | 'DONE') => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    DONE: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <Card hover className="group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {task.title}
          </h3>
          <p className="mt-2 text-gray-600 line-clamp-2 text-sm md:text-base">
            {task.description}
          </p>
          
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
              ${statusColors[task.status]}
            `}>
              {task.status}
            </span>
            
            {task.assignedUser && (
              <span className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {task.assignedUser.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-row sm:flex-col gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as 'PENDING' | 'PROCESSING' | 'DONE')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="DONE">Done</option>
          </select>
          
          <Button
            variant="danger"
           
            onClick={() => onDelete(task.id)}
            className="!text-red-600 !border-red-300 hover:!bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};