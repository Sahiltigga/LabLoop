import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <LoadingSpinner message="Checking user permissions..." size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard based on their role
    const defaultPaths = {
      admin: '/dashboard/admin',
      faculty: '/dashboard/faculty',
      student: '/dashboard/student',
      technician: '/dashboard/technician',
    };
    return <Navigate to={defaultPaths[user.role] || '/dashboard/student'} replace />;
  }

  return children;
};

export default RoleRoute;

