import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@components/common/Card';
import { Loader } from '@components/common/Loader';
import { Pagination } from '@common/Pagination';
import { apiService } from '@services/api.service';
import { API } from '@config/api';
import { ToastService } from '@services/toast.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
}
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip?: number;
  take?: number;
}
export const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    const skip = (currentPage - 1) * pageSize;
    
    try {
      const response = await apiService.get<PaginatedResponse<User>>(`${API.users.list}?skip=${skip}&take=${pageSize}`);
      const data = response.data || response;
      setUsers(data);
      setTotalUsers(response.total || data.length);
    } catch (error) {
      ToastService.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: 'bg-purple-100 text-purple-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    return badges[role as keyof typeof badges] || badges.USER;
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && users.length === 0) {
    return <Loader text="Loading users..." />;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{user.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500">No users found</div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalUsers}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        loading={loading}
      />
    </Card>
  );
};