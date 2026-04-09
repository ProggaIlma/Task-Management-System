import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { apiService } from '@services/api.service';
import { API } from '@config/api';
import { DashboardLayout } from '@layout/DashboardLayout';
import { TaskTable } from '@pages/TaskList';
import { TaskForm } from '@pages/TaskForm';
import { AuditLogTable } from '@pages/AuditLog';
import { UserTable } from '@pages/UserList';
import { Profile } from '@pages/Profile';
import { StatsCard } from '@common/StatsCard';
import { Button } from '@common/Button';
import { Modal } from '@common/Modal';
import { Loader } from '@common/Loader';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE';
  assignedTo?: string;
  assignedUser?: User;
  createdAt: string;
}

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

type TabType = 'tasks' | 'audit' | 'users' | 'profile';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStatsAndUsers();
  }, [user]);

  const fetchStatsAndUsers = () => {
    setLoading(true);
    
    apiService.get<{ total: number; pending: number; processing: number; done: number }>(API.tasks.stats)
      .then((stats) => {
        setStats(stats);
        
        if (user?.role === 'ADMIN') {
          return apiService.get<PaginatedResponse<User>>(`${API.users.list}?skip=0&take=100`);
        }
        return Promise.resolve(null);
      })
      .then((usersResponse) => {
        if (usersResponse) {
          setUsers(usersResponse.data || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      });
  };

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    setRefreshKey(prev => prev + 1);
    fetchStatsAndUsers();
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-sm text-gray-500 mt-1">Task Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavItem 
          active={activeTab === 'tasks'} 
          onClick={() => setActiveTab('tasks')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Tasks"
        />

        {user?.role === 'ADMIN' && (
          <>
            <NavItem 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              label="Users"
            />
            <NavItem 
              active={activeTab === 'audit'} 
              onClick={() => setActiveTab('audit')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Audit Logs"
            />
          </>
        )}

        <NavItem 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          label="Profile"
        />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const header = (
    <div className="flex items-center justify-between w-full">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        {activeTab === 'tasks' && 'Task Management'}
        {activeTab === 'users' && 'User Management'}
        {activeTab === 'audit' && 'Audit Logs'}
        {activeTab === 'profile' && 'My Profile'}
      </h2>
      {activeTab === 'tasks' && user?.role === 'ADMIN' && (
        <Button onClick={() => setShowTaskForm(true)}>
          New Task
        </Button>
      )}
    </div>
  );

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;

  return (
    <DashboardLayout sidebar={sidebar} header={header}>
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatsCard label="Total Tasks" value={stats.total} color="gray" />
            <StatsCard label="Pending" value={stats.pending} color="yellow" />
            <StatsCard label="Processing" value={stats.processing} color="blue" />
            <StatsCard label="Done" value={stats.done} color="green" />
          </div>

          <Modal 
            isOpen={showTaskForm} 
            onClose={() => setShowTaskForm(false)}
            title="Create New Task"
          >
            <TaskForm
              users={users}
              onSuccess={handleTaskSuccess}
              onCancel={() => setShowTaskForm(false)}
            />
          </Modal>

          <TaskTable key={refreshKey} isAdmin={user?.role === 'ADMIN'} onTaskUpdate={fetchStatsAndUsers}/>
        </div>
      )}

      {activeTab === 'users' && user?.role === 'ADMIN' && <UserTable />}
      {activeTab === 'audit' && user?.role === 'ADMIN' && <AuditLogTable />}
      {activeTab === 'profile' && <Profile />}
    </DashboardLayout>
  );
};

const NavItem: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center px-4 py-3 rounded-lg transition-all
      ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}
    `}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

export default Dashboard;