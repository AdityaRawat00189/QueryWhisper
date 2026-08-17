import apiClient from './apiClient';

export const databaseApi = {
  /**
   * Save and test database credentials for environment
   * POST /v0/api/saveCredentials
   * @param {{ environment: string, dbUser: string, dbHost: string, dbName: string, dbPort: number|string, password: string }} payload
   */
  saveCredentials: async (payload) => {
    // Ensure dbPort is passed as a number or clean string as expected
    const sanitizedPayload = {
      ...payload,
      dbPort: Number(payload.dbPort),
    };
    const response = await apiClient.post('/v0/api/saveCredentials', sanitizedPayload);
    return response.data;
  },

  /**
   * Get all registered database names for authenticated user
   * GET /v0/api/database/all
   */
  getAllDatabases: async () => {
    const response = await apiClient.get('/v0/api/database/all');
    return response.data;
  },

  /**
   * Add a new database under existing credentials
   * POST /v0/api/database/add
   * @param {string} dbName
   */
  addDatabase: async (dbName) => {
    const response = await apiClient.post('/v0/api/database/add', { dbName });
    return response.data;
  },
};

export default databaseApi;
