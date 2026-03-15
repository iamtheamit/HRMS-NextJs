// useApi.ts
// Provides a simple wrapper hook around the shared Axios API client.

import { useMemo } from 'react';
import { apiClient } from '@/shared/api/apiClient';

export const useApi = () => {
  const client = useMemo(() => apiClient, []);
  return client;
};

