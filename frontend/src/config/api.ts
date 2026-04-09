const API_URLS = {
  local: 'http://localhost:3001',
  dev: 'https://dev-api.example.com',
  prod: 'https://api.example.com',
};

const currentEnv: 'local' | 'dev' | 'prod' = 'local';

export const API = {
  baseURL: API_URLS[currentEnv],
  
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

// Then use like this:
