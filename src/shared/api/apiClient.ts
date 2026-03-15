import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL || '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Example interceptor for auth token. Replace with your auth store retrieval.
apiClient.interceptors.request.use((config) => {
  try {
    // read token from localStorage or cookie if needed
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
});

export default apiClient;
