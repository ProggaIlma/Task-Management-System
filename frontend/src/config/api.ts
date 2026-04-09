const API_URLS = {
  local: 'http://localhost:3001',
  docker: '/api',
  prod: 'https://api.example.com',
};

// Use VITE_API_URL if set (Docker build), otherwise fallback to localhost for local dev
export const API = {
  baseURL: import.meta.env.VITE_API_URL || API_URLS.local,

  auth: {
    login: '/auth/login',
    profile: '/auth/profile',
  },

  tasks: {
    list: '/tasks',
    create: '/tasks',
    stats: '/tasks/stats',
    get: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    delete: (id: string) => `/tasks/${id}`,
  },

  users: {
    list: '/users',
  },

  audit: {
    list: '/audit',
  },
};