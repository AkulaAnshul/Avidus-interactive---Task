import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard component that handles private and role-restricted routing on the frontend.
 *
 * @param {React.ReactNode} children - The protected target view component
 * @param {boolean} adminOnly - If set to true, only users with role === 'Admin' are authorized
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  // Show a premium glassmorphic loader while verification is running
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#090c10',
        color: '#f0f6fc',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(16, 185, 129, 0.1)',
          borderTop: '3px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }} />
        <p style={{ letterSpacing: '0.05em', color: '#8b949e' }}>
          VERIFYING SECURITY CREDENTIALS...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated? Bounce to Login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin routing check
  if (adminOnly && user.role !== 'Admin') {
    // If not Admin, redirect to regular user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
