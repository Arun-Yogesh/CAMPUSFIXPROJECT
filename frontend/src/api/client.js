/**
 * CampusFix API Client
 * Centralized fetch client handling Authorization tokens, headers, and error formatting.
 */

const BASE_URL = '/api';

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = localStorage.getItem('campusfix_token');

  const headers = {
    ...customConfig.headers,
  };

  // If body is FormData (file upload), let browser set Content-Type with boundary
  if (!(body instanceof FormData) && customConfig.method && customConfig.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const config = {
    ...customConfig,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error('Network connection failure. Please check if the backend server is running.');
  }

  // Parse JSON or return empty on 204
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Extract meaningful error messages
    let errorMsg = 'An unexpected error occurred.';
    if (data) {
      if (typeof data === 'string') {
        errorMsg = data;
      } else if (data.error) {
        errorMsg = data.error;
      } else if (data.detail) {
        errorMsg = data.detail;
      } else if (data.message) {
        errorMsg = data.message;
      } else {
        // Collect field validation errors
        const messages = [];
        for (const [key, value] of Object.entries(data)) {
          const valStr = Array.isArray(value) ? value.join(' ') : String(value);
          messages.push(`${key}: ${valStr}`);
        }
        if (messages.length) errorMsg = messages.join(' | ');
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
