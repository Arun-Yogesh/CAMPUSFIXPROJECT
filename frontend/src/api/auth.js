import { apiClient } from './client';

export const authApi = {
  login: (email, password) =>
    apiClient('/auth/login/', {
      method: 'POST',
      body: { email, password },
    }),

  register: (userData) =>
    apiClient('/auth/register/', {
      method: 'POST',
      body: userData,
    }),

  logout: () =>
    apiClient('/auth/logout/', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    apiClient('/auth/me/', {
      method: 'GET',
    }),
};
