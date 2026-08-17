import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';
import databaseApi from '../services/databaseApi';
import { extractErrorMessage } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [databases, setDatabases] = useState([]);
  const [activeDatabase, setActiveDatabase] = useState(null);
  const [hasDatabaseCredentials, setHasDatabaseCredentials] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Fetch databases for the logged-in user
   */
  const loadUserDatabases = useCallback(async () => {
    try {
      const response = await databaseApi.getAllDatabases();
      const dbs = response?.databases || [];
      setDatabases(dbs);
      
      if (dbs.length > 0) {
        setHasDatabaseCredentials(true);
        // Default to first database if activeDatabase is not set or not in list
        setActiveDatabase((prev) => {
          if (prev && dbs.some((d) => d.dbName === prev)) return prev;
          return dbs[0].dbName;
        });
        return { hasDatabases: true, databases: dbs };
      } else {
        setHasDatabaseCredentials(false);
        setActiveDatabase(null);
        return { hasDatabases: false, databases: [] };
      }
    } catch (err) {
      // If 404 or 401 or empty, user doesn't have credentials configured yet
      setDatabases([]);
      setActiveDatabase(null);
      setHasDatabaseCredentials(false);
      return { hasDatabases: false, databases: [] };
    }
  }, []);

  /**
   * Initialize session check on application load
   */
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const meResponse = await authApi.getMe();
      if (meResponse?.user) {
        setUser(meResponse.user);
        setIsAuthenticated(true);
        await loadUserDatabases();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [loadUserDatabases]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Handle user login
   */
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const response = await authApi.login(credentials);
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        const dbResult = await loadUserDatabases();
        return { 
          success: true, 
          user: response.user, 
          hasDatabaseCredentials: dbResult.hasDatabases 
        };
      }
      throw new Error('Invalid response from server.');
    } catch (err) {
      const message = extractErrorMessage(err, 'Failed to sign in. Please check your credentials.');
      setAuthError(message);
      throw new Error(message);
    }
  };

  /**
   * Handle user signup
   */
  const signup = async (payload) => {
    setAuthError(null);
    try {
      const response = await authApi.signup(payload);
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setHasDatabaseCredentials(false);
        setDatabases([]);
        return { 
          success: true, 
          user: response.user, 
          hasDatabaseCredentials: false 
        };
      }
      throw new Error('Failed to create account.');
    } catch (err) {
      const message = extractErrorMessage(err, 'Signup failed. Please check your input.');
      setAuthError(message);
      throw new Error(message);
    }
  };

  /**
   * Handle user logout
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setDatabases([]);
      setActiveDatabase(null);
      setHasDatabaseCredentials(false);
    }
  };

  /**
   * Mark database as connected after successful credential save
   */
  const handleDatabaseConnected = async (dbName) => {
    setHasDatabaseCredentials(true);
    if (dbName) {
      setActiveDatabase(dbName);
    }
    await loadUserDatabases();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    databases,
    activeDatabase,
    hasDatabaseCredentials,
    authError,
    login,
    signup,
    logout,
    checkAuth,
    refreshDatabases: loadUserDatabases,
    setActiveDatabase,
    handleDatabaseConnected,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
