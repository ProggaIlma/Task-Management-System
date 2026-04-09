import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@common/Card';
import { Loader } from '@common/Loader';
import { Pagination } from '@common/Pagination';
import { apiService } from '@services/api.service';
import { API } from '@config/api';
import { ToastService } from '@services/toast.service';

interface AuditLog {
  id: string;
  action: string;
  summary: string;
  createdAt: string;
  actor: { name: string; email: string };
  target?: { title: string };
}
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip?: number;
  take?: number;
}
export const AuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize]);

  const fetchLogs = async () => {
    setLoading(true);
    const skip = (currentPage - 1) * pageSize;
    
    try {
      const response = await apiService.get<PaginatedResponse<AuditLog>>(`${API.audit.list}?skip=${skip}&take=${pageSize}`);
      const data = response.data || response;
      setLogs(data);
      setTotalLogs(response.total || data.length);
    } catch (error) {
      ToastService.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      CREATE_TASK: 'bg-green-100 text-green-800',
      UPDATE_TASK: 'bg-blue-100 text-blue-800',
      DELETE_TASK: 'bg-red-100 text-red-800',
      STATUS_CHANGE: 'bg-yellow-100 text-yellow-800',
      ASSIGNMENT_CHANGE: 'bg-purple-100 text-purple-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  if (loading && logs.length === 0) {
    return <Loader text="Loading audit logs..." />;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{log.summary}</p>
                  {log.target && (
                    <p className="text-xs text-gray-500 mt-1">Task: {log.target.title}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{log.actor.name}</p>
                  <p className="text-xs text-gray-500">{log.actor.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500">No audit logs found</div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalLogs}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        loading={loading}
      />
    </Card>
  );
};