import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Normalizes backend error responses into human-readable messages.
 * Prevents exposing raw ugly stack traces or undefined errors to the UI.
 */
export const extractErrorMessage = (error, defaultMessage = 'An unexpected error occurred. Please try again.') => {
  if (!error) return defaultMessage;
  
  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data?.details) return `${data.error ? `${data.error}: ` : ''}${data.details}`;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    
    if (error.response.status === 401) return 'Unauthorized. Please log in to continue.';
    if (error.response.status === 403) return 'You do not have permission to perform this action.';
    if (error.response.status === 404) return 'The requested resource was not found.';
    if (error.response.status === 409) return 'Conflict: Resource already exists.';
    if (error.response.status >= 500) return 'Internal server error. Please check your backend connection.';
  }
  
  if (error.request) {
    return 'Unable to reach backend server. Please verify the backend is running on port 5000.';
  }
  
  return error.message || defaultMessage;
};

export default apiClient;
