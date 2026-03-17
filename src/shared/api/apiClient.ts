import axios from 'axios';

// API base URL resolved from environment configuration
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL || 'https://hrms-node-steel.vercel.app/api';

// API key from environment for x-api-key header authentication
const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

// Simple logging function for frontend
const logRequest = (method: string, url: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [REQUEST] ${method} ${url}`, details || '');
};

const logResponse = (method: string, url: string, status: number, duration: number) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [RESPONSE] ${method} ${url} → ${status} (${duration}ms)`);
};

const logError = (method: string, url: string, error: any) => {
  const timestamp = new Date().toISOString();
  const status = error.response?.status || 'Network Error';
  const message = error.response?.data?.message || error.message || 'Unknown error';
  console.error(`[${timestamp}] [ERROR] ${method} ${url} → ${status}`, {
    message,
    data: error.response?.data,
    details: error.message,
  });
};

// Log configuration
if (!apiKey) {
  console.warn('[API] NEXT_PUBLIC_API_KEY not configured - API requests will be rejected by backend');
}

console.log('[API] Client initialized', {
  baseURL,
  hasApiKey: !!apiKey,
  environment: process.env.NODE_ENV,
});

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Attach API key to all outgoing requests for backend validation
// This ensures every API call includes the security header
apiClient.interceptors.request.use((config) => {
  const requestStartTime = Date.now();
  
  if (apiKey) {
    config.headers = config.headers || {};
    // Include x-api-key header for backend API key middleware validation
    config.headers['x-api-key'] = apiKey;
  }

  // Log outgoing request
  logRequest(config.method?.toUpperCase() || 'REQUEST', config.url || '', {
    params: config.params,
    hasData: !!config.data,
    hasApiKey: !!apiKey,
  });

  // Store request start time for duration calculation
  (config as any).__requestStartTime = requestStartTime;

  return config;
});

// --- 401 auto-refresh interceptor ---
let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

const drainQueue = (ok: boolean) => {
  refreshQueue.forEach((resolve) => resolve(ok));
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Log successful response with duration
    const startTime = (response.config as any).__requestStartTime || Date.now();
    const duration = Date.now() - startTime;
    logResponse(
      response.config.method?.toUpperCase() || 'REQUEST',
      response.config.url || '',
      response.status,
      duration
    );
    return response;
  },
  async (error) => {
    const original = error.config;
    const startTime = (original as any).__requestStartTime || Date.now();
    const duration = Date.now() - startTime;

    // Log error response
    logError(
      original.method?.toUpperCase() || 'REQUEST',
      original.url || '',
      error
    );

    // Only handle 401s that haven't already been retried and aren't the refresh call itself.
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    console.log('[API] 401 Unauthorized - attempting to refresh token...');
    original._retry = true;

    if (isRefreshing) {
      // Queue this request until the in-flight refresh resolves.
      console.log('[API] Token refresh already in progress, queueing request...');
      return new Promise((resolve, reject) => {
        refreshQueue.push((ok) => {
          if (ok) resolve(apiClient(original));
          else reject(error);
        });
      });
    }

    isRefreshing = true;

    try {
      console.log('[API] Calling /auth/refresh...');
      await apiClient.post('/auth/refresh');
      console.log('[API] Token refreshed successfully');
      isRefreshing = false;
      drainQueue(true);
      return apiClient(original);
    } catch (refreshError: any) {
      console.error('[API] Token refresh failed', {
        status: refreshError.response?.status,
        message: refreshError.response?.data?.message || refreshError.message,
      });
      isRefreshing = false;
      drainQueue(false);
      // Clear in-memory auth state so the UI redirects to login.
      const { useAuthStore } = await import('@/store/authStore');
      useAuthStore.getState().clearAuth();
      console.log('[API] Auth state cleared, redirecting to login');
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
