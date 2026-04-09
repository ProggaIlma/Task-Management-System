import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@common/Input';
import { Button } from '@common/Button';
import { Card } from '@common/Card';
import { useAuth } from '@hooks/useAuth';
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = { email: '', password: '' };
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    login(formData.email, formData.password)
      .then(() => navigate('/'))
      .catch(() => setLoading(false));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      user: { email: 'user@example.com', password: 'user123' },
    };
    setFormData(credentials[type]);
    setErrors({ email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="mt-2 text-gray-600">Sign in to manage your tasks</p>
        </div>

        {/* Login Form */}
        <Card padding="lg" className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              error={errors.email}
          
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter your password"
                error={errors.password}
               
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              
              className="mt-6"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-900 mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">👑</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Admin</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => fillDemoCredentials('user')}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">👤</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600">User</p>
                    <p className="text-xs text-gray-500">user@example.com</p>
                  </div>
                </div>
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-3">
              Password: admin123 / user123
            </p>
          </div> */}
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Task Management System • Role-Based Access Control
        </p>
      </div>
    </div>
  );
};