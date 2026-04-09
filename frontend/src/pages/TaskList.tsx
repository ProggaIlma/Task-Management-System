import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@common/Button';
import { StatusSelect } from '@common/StatusSelect';
import { Card } from '@common/Card';
import { Loader } from '@common/Loader';
import { Pagination } from '@common/Pagination';
import { ConfirmModal } from '@common/ConfirmModal';
import { apiService } from '@services/api.service';
import { API } from '@config/api';
import { ToastService } from '@services/toast.service';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE';
  assignedTo?: string;
  assignedUser?: User;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip?: number;
  take?: number;
}

interface TaskTableProps {
  isAdmin?: boolean;
  onTaskUpdate?: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ 
  isAdmin = false, 
  onTaskUpdate 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalTasks, setTotalTasks] = useState(0);
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: '',
    taskTitle: '',
    loading: false,
  });

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'DONE', label: 'Done' },
  ];

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      const response = await apiService.get<PaginatedResponse<User>>(`${API.users.list}?skip=0&take=100`);
      const usersData = response.data || response;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const skip = (currentPage - 1) * pageSize;
    
    try {
      const response = await apiService.get<PaginatedResponse<Task>>(`${API.tasks.list}?skip=${skip}&take=${pageSize}`);
      
      let tasksData: Task[] = [];
      let total = 0;
      
      if (response?.data && Array.isArray(response.data)) {
        tasksData = response.data;
        total = response.total || response.data.length;
      } else if (Array.isArray(response)) {
        tasksData = response;
        total = response.length;
      }
      
      setTasks(tasksData);
      setTotalTasks(total);
    } catch (error) {
      ToastService.error('Failed to load tasks');
      setTasks([]);
      setTotalTasks(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await apiService.put(API.tasks.update(taskId), { status });
      ToastService.success('Status updated');
      fetchTasks();
      onTaskUpdate?.();
    } catch (error) {
      ToastService.error('Failed to update status');
    }
  };

  const handleAssignmentChange = async (taskId: string, assignedTo: string) => {
    try {
      await apiService.put(API.tasks.update(taskId), { 
        assignedTo: assignedTo || null 
      });
      ToastService.success('Task reassigned');
      fetchTasks();
      onTaskUpdate?.();
    } catch (error) {
      ToastService.error('Failed to reassign task');
    }
  };

  const handleDeleteClick = (taskId: string, taskTitle: string) => {
    setDeleteModal({
      isOpen: true,
      taskId,
      taskTitle,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      await apiService.delete(API.tasks.delete(deleteModal.taskId));
      ToastService.success('Task deleted successfully');
      setDeleteModal({ isOpen: false, taskId: '', taskTitle: '', loading: false });
      fetchTasks();
      onTaskUpdate?.();
    } catch (error) {
      ToastService.error('Failed to delete task');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, taskId: '', taskTitle: '', loading: false });
  };

  const totalPages = Math.ceil(totalTasks / pageSize);

  if (loading && tasks.length === 0) {
    return <Loader text="Loading tasks..." />;
  }

  return (
    <>
      <Card padding="none" className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {task.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelect
                      value={task.status}
                      onChange={(value) => handleStatusChange(task.id, value)}
                      options={statusOptions}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <select
                        value={task.assignedTo || ''}
                        onChange={(e) => handleAssignmentChange(task.id, e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {task.assignedUser?.name || 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {format(new Date(task.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <Button
                        variant="danger"
                        
                        onClick={() => handleDeleteClick(task.id, task.title)}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <StatusSelect
                  value={task.status}
                  onChange={(value) => handleStatusChange(task.id, value)}
                  options={statusOptions}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Assigned:</span>
                {isAdmin ? (
                  <select
                    value={task.assignedTo || ''}
                    onChange={(e) => handleAssignmentChange(task.id, e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">
                    {task.assignedUser?.name || 'Unassigned'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created:</span>
                <span className="text-sm text-gray-500">
                  {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Updated:</span>
                <span className="text-sm text-gray-500">
                  {format(new Date(task.updatedAt), 'MMM dd, yyyy')}
                </span>
              </div>
              
              {isAdmin && (
                <Button
                  variant="danger"
                  
                  fullWidth
                  onClick={() => handleDeleteClick(task.id, task.title)}
                >
                  Delete Task
                </Button>
              )}
            </div>
          ))}
        </div>

        {tasks.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No tasks found
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalTasks}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          loading={loading}
        />
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteModal.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteModal.loading}
        variant="danger"
      />
    </>
  );
};

export default TaskTable;