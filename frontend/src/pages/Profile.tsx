import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Card } from '@common/Card';
import { Button } from '@common/Button';
import { Input } from '@common/Input';
import { apiService } from '@services/api.service';
import { API } from '@config/api';
import { ToastService } from '@services/toast.service';

interface TaskStats {
  total: number;
  pending: number;
  processing: number;
  done: number;
}

export const Profile: React.FC = () => {
  const { user, token, setAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, processing: 0, done: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = () => {
    apiService.get<TaskStats>(API.tasks.stats)
      .then((stats) => {
        setStats(stats);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsLoading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    apiService.put(`${API.users.list}/${user?.id}`, { name: formData.name })
      .then((response) => {
        // Update user in auth store
        const updatedUser = { ...user!, name: formData.name };
        setAuth(updatedUser, token!);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        ToastService.success('Profile updated successfully');
        setIsEditing(false);
      })
      .catch(() => ToastService.error('Failed to update profile'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card padding="lg">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              disabled
            />
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user?.name || '', email: user?.email || '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <InfoRow label="Account ID" value={user?.id?.slice(0, 8) + '...' || ''} />
            <InfoRow label="Role" value={user?.role || ''} />
            <InfoRow label="Email" value={user?.email || ''} />
            
            <div className="pt-4">
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {statsLoading ? '-' : stats.total}
            </p>
            <p className="text-sm text-gray-500">Total Tasks</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {statsLoading ? '-' : stats.pending}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {statsLoading ? '-' : stats.processing}
            </p>
            <p className="text-sm text-gray-500">Processing</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {statsLoading ? '-' : stats.done}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex py-2 border-b border-gray-100">
    <span className="text-sm text-gray-500 w-32">{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);