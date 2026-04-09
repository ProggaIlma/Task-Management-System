import { useAuthStore } from '@store/authStore';
import { apiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { API } from '../config/api';
import { set } from 'date-fns';
interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
  };
  access_token: string;
}

export const useAuth = () => {
  const { user, token, setAuth, logout: clearAuth } = useAuthStore();

  const login = (email: string, password: string): Promise<LoginResponse> => {
    return apiService.post<LoginResponse>(API.auth.login, { email, password })
      .then((data) => {
        setAuth(data.user, data.access_token);
        ToastService.success('Login successful');
        return data;
      });
  };

  const logout = () => {
    clearAuth();
    ToastService.success('Logged out');
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
    setAuth
  };
};