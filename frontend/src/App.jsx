import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Departments from './pages/Departments';
import Profile from './pages/Profile';

// Root Redirect Helper
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'faculty':
      return <Navigate to="/dashboard/faculty" replace />;
    case 'technician':
      return <Navigate to="/dashboard/technician" replace />;
    case 'student':
    default:
      return <Navigate to="/dashboard/student" replace />;
  }
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root Route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RootRedirect />
                </ProtectedRoute>
              }
            />

            {/* Role Dashboards */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/faculty"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['faculty', 'admin']}>
                    <FacultyDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['student', 'faculty', 'admin']}>
                    <StudentDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/technician"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['technician', 'admin']}>
                    <TechnicianDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Core Operational Routes */}
            <Route
              path="/equipment"
              element={
                <ProtectedRoute>
                  <Equipment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment/:id"
              element={
                <ProtectedRoute>
                  <EquipmentDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <Maintenance />
                </ProtectedRoute>
              }
            />

            {/* Innovation Engine & Analytics */}
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin', 'faculty']}>
                    <Analytics />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Department Management */}
            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin', 'faculty']}>
                    <Departments />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* User Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

