import { apiClient } from './client';

export const complaintsApi = {
  // Read all or filtered complaints
  getComplaints: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/complaints/${qs}`, { method: 'GET' });
  },

  // Read single complaint
  getComplaint: (id) => apiClient(`/complaints/${id}/`, { method: 'GET' }),

  // Create complaint (handles FormData for optional image)
  createComplaint: (formData) =>
    apiClient('/complaints/', {
      method: 'POST',
      body: formData,
    }),

  // Update complaint (student or admin)
  updateComplaint: (id, data) =>
    apiClient(`/complaints/${id}/`, {
      method: 'PATCH',
      body: data,
    }),

  // Delete complaint
  deleteComplaint: (id) =>
    apiClient(`/complaints/${id}/`, {
      method: 'DELETE',
    }),

  // Dashboard analytics
  getAnalytics: () => apiClient('/complaints/analytics/', { method: 'GET' }),

  // Smart Feature: Duplicate check
  checkDuplicate: ({ category, location, title, exclude_id }) => {
    const query = new URLSearchParams({
      category: category || '',
      location: location || '',
      title: title || '',
    });
    if (exclude_id) query.append('exclude_id', exclude_id);
    return apiClient(`/complaints/check_duplicate/?${query.toString()}`, { method: 'GET' });
  },

  // Smart Feature: Priority detection heuristic
  detectPriority: (title, description) =>
    apiClient('/complaints/detect_priority/', {
      method: 'POST',
      body: { title, description },
    }),

  // Admin action: Assign staff
  assignStaff: (complaintId, staffId) =>
    apiClient(`/complaints/${complaintId}/assign_staff/`, {
      method: 'PATCH',
      body: { staff_id: staffId },
    }),

  // Admin / Staff action: Update status
  updateStatus: (complaintId, status) =>
    apiClient(`/complaints/${complaintId}/update_status/`, {
      method: 'PATCH',
      body: { status },
    }),
};
