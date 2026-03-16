import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL || 'https://hrms-node-steel.vercel.app/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// --- 401 auto-refresh interceptor ---
let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

const drainQueue = (ok: boolean) => {
  refreshQueue.forEach((resolve) => resolve(ok));
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only handle 401s that haven't already been retried and aren't the refresh call itself.
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Queue this request until the in-flight refresh resolves.
      return new Promise((resolve, reject) => {
        refreshQueue.push((ok) => {
          if (ok) resolve(apiClient(original));
          else reject(error);
        });
      });
    }

    isRefreshing = true;

    try {
      await apiClient.post('/auth/refresh');
      isRefreshing = false;
      drainQueue(true);
      return apiClient(original);
    } catch {
      isRefreshing = false;
      drainQueue(false);
      // Clear in-memory auth state so the UI redirects to login.
      const { useAuthStore } = await import('@/store/authStore');
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }
  }
);

export default apiClient;
