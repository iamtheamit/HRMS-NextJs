import apiClient from '@/shared/api/apiClient';

export async function logoutApi() {
  // Backend clears the HttpOnly auth cookies. No body needed because the
  // refresh token is read from the cookie by the server.
  await apiClient.post('/auth/logout');
}

export async function logoutAllApi() {
  await apiClient.post('/auth/logout-all');
}
