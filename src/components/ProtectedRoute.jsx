
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = 'authenticated' }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access
  if (requiredRole === 'admin') {
    if (currentUser.rol !== 'admin') {
      return <Navigate to="/cajero" replace />; // Redirect non-admins to cajero
    }
  }

  // If requiredRole is 'cajero' or just 'authenticated', all authenticated users can access
  // Since we already checked !currentUser, they are authenticated.
  
  return children;
};

export default ProtectedRoute;
