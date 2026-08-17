import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';

/**
 * ProtectedRoute ensures only authenticated users can access the route.
 * @param {{ requireDatabase?: boolean }} props
 */
export const ProtectedRoute = ({ requireDatabase = true }) => {
  const { isAuthenticated, loading, hasDatabaseCredentials } = useAuth();

  if (loading) {
    return <LoadingState fullScreen message="Checking workspace session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If page requires a connected DB (e.g. /playground) but user has none
  if (requireDatabase && !hasDatabaseCredentials) {
    return <Navigate to="/database-setup" replace />;
  }

  // If user is on /database-setup but already has a DB connected
  if (!requireDatabase && hasDatabaseCredentials) {
    return <Navigate to="/playground" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
