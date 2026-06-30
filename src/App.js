import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layouts/Layout';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import ViewStudents from './Pages/ViewStudents';
import StudentForm from './Pages/StudentForm';
import MarkAttendance from './Pages/MarkAttendance';
import Reports from './Pages/Reports';
import Profile from './Pages/Profile';
import { AlertCircle } from 'lucide-react';

// Wrapper for protecting routes based on roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// 404 Page Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
      <AlertCircle className="text-indigo-600 dark:text-indigo-400 mb-4 animate-bounce" size={48} />
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        The resource you are looking for does not exist or has been relocated to another address.
      </p>
      <a
        href="/dashboard"
        className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm font-medium transition-all"
      >
        Return to Dashboard
      </a>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <ViewStudents />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance/mark"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <MarkAttendance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance/report"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
