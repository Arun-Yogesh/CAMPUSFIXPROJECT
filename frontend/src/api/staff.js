import { apiClient } from './client';

export const staffApi = {
  getStaff: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/staff/${qs}`, { method: 'GET' });
  },

  getStaffMember: (id) => apiClient(`/staff/${id}/`, { method: 'GET' }),

  createStaff: (data) =>
    apiClient('/staff/', {
      method: 'POST',
      body: data,
    }),

  updateStaff: (id, data) =>
    apiClient(`/staff/${id}/`, {
      method: 'PATCH',
      body: data,
    }),

  deleteStaff: (id) =>
    apiClient(`/staff/${id}/`, {
      method: 'DELETE',
    }),
};
