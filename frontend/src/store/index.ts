import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE';
  assignedTo?: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  tasks: Task[];
  loading: boolean;
  
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tasks: [],
      loading: false,
      
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null, tasks: [] }),
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'task-management-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);