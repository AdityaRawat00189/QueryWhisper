import apiClient from './apiClient';

export const queryApi = {
  /**
   * Execute raw SQL query against active database
   * POST /v0/api/execute-query
   * @param {{ dbName: string, query: string }} payload
   */
  executeQuery: async ({ dbName, query }) => {
    const response = await apiClient.post('/v0/api/execute-query', {
      dbName,
      query,
    });
    return response.data;
  },
};

export default queryApi;
