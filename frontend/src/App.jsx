import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import DatabaseSetup from './pages/DatabaseSetup';
import Playground from './pages/Playground';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Database Setup Route (Authenticated, but doesn't require existing DB) */}
          <Route element={<ProtectedRoute requireDatabase={false} />}>
            <Route path="/database-setup" element={<DatabaseSetup />} />
          </Route>

          {/* Core Application Route (Authenticated & Database Connected) */}
          <Route element={<ProtectedRoute requireDatabase={true} />}>
            <Route path="/playground" element={<Playground />} />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/playground" replace />} />

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/playground" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
