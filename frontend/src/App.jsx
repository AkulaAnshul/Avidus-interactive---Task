import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import TaskMonitoring from './pages/TaskMonitoring';
import ActivityLogs from './pages/ActivityLogs';

// Clean Landing Component for the root path (/)
const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '2rem 1rem',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <div className="glass-card" style={{
        maxWidth: '550px',
        width: '100%',
        padding: '2.5rem 1.5rem',
        borderTop: '4px solid var(--accent-blue)',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          color: 'var(--text-main)',
          marginBottom: '1rem'
        }}>
          Granular RBAC & Task Audits
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          maxWidth: '440px',
          margin: '0 auto 2rem auto',
          lineHeight: 1.5
        }}>
          Experience simplified role-based access control and persistent user activity logging inside a setup-free React and Node.js environment.
        </p>

        {user ? (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              Signed in as <strong>{user.name}</strong> ({user.role})
            </p>
            <Link
              to={user.role === 'Admin' ? '/admin' : '/dashboard'}
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.5rem' }}
            >
              Enter Workspace
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.5rem' }}
            >
              Sign In Account
            </Link>
            <Link
              to="/register"
              className="btn btn-secondary"
              style={{ padding: '0.7rem 1.5rem' }}
            >
              Register Workspace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Router
const AppRoutes = () => {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute adminOnly={true}>
              <TaskMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute adminOnly={true}>
              <ActivityLogs />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
