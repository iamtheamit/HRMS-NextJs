import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL || '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Attach persisted auth token for API requests.
apiClient.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hrms_token') : null;
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
});

export default apiClient;
