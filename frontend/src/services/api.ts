import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API } from '../config/api';
const api = axios.create({
  baseURL: API.baseURL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // Get from store, not localStorage directly
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});