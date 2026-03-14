// apiClient.ts
// Configures the shared Axios API client with baseURL, auth token, and error handling.

import axios from 'axios';

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('hrms_token')
      : null;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Optionally trigger a global auth reset or redirect.
    }

    return Promise.reject(error);
  }
);

