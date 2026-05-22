import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(
      `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  });
}

export default api;
