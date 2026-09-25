import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

let activeToken: string | null = null;

export const setApiAccessToken = (token: string | null) => {
  activeToken = token;
};

export const getApiAccessToken = () => activeToken;

api.interceptors.request.use((config) => {
  if (activeToken && config.headers) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }
  return config;
});

export default api;