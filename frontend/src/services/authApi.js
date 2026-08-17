import apiClient from './apiClient';

export const authApi = {
  /**
   * Register a new user account
   * POST /v0/api/auth/signup
   * @param {{ username: string, email: string, password: string }} payload
   */
  signup: async (payload) => {
    const response = await apiClient.post('/v0/api/auth/signup', payload);
    return response.data;
  },

  /**
   * Log in with existing credentials
   * POST /v0/api/auth/login
   * @param {{ email: string, password: string }} payload
   */
  login: async (payload) => {
    const response = await apiClient.post('/v0/api/auth/login', payload);
    return response.data;
  },

  /**
   * Destroy user session
   * POST /v0/api/auth/logout
   */
  logout: async () => {
    const response = await apiClient.post('/v0/api/auth/logout');
    return response.data;
  },

  /**
   * Fetch currently authenticated user from session
   * GET /v0/api/auth/me
   */
  getMe: async () => {
    const response = await apiClient.get('/v0/api/auth/me');
    return response.data;
  },
};

export default authApi;
