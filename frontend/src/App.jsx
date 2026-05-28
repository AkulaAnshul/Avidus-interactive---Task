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

// Beautiful Landing Component for the root path (/)
const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      textAlign: 'center',
      padding: '2rem 1.5rem',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div className="glass-card" style={{
        maxWidth: '650px',
        width: '100%',
        padding: '3rem 2rem',
        borderTop: '5px solid var(--accent-primary)',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '2.75rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          color: '#f0f6fc',
          fontFamily: "'Outfit', sans-serif",
          marginBottom: '1rem'
        }}>
          Advanced Access Control & Task Monitoring
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.05rem',
          maxWidth: '520px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6
        }}>
          Experience granular role-based permissions (RBAC) and real-time database activity tracking logs inside a premium dark glassmorphic task manager environment.
        </p>

        {user ? (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Currently signed in as <strong style={{ color: '#fff' }}>{user.name}</strong> ({user.role})
            </p>
            <Link
              to={user.role === 'Admin' ? '/admin' : '/dashboard'}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem' }}
            >
              Enter My Console Deck
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem' }}
            >
              Sign In Account
            </Link>
            <Link
              to="/register"
              className="btn btn-secondary"
              style={{ padding: '0.85rem 2rem' }}
            >
              Register Workspace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Router structure
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
