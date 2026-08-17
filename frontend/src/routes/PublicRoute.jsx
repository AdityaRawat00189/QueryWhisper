import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';

/**
 * PublicRoute prevents already-authenticated users from seeing /login and /signup.
 */
export const PublicRoute = () => {
  const { isAuthenticated, loading, hasDatabaseCredentials } = useAuth();

  if (loading) {
    return <LoadingState fullScreen message="Checking workspace session..." />;
  }

  if (isAuthenticated) {
    if (hasDatabaseCredentials) {
      return <Navigate to="/playground" replace />;
    }
    return <Navigate to="/database-setup" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
