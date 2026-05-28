import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ClipboardList, Users, Activity, BarChart2, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to determine if a route is currently active
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(13, 17, 23, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      {/* App Logo/Branding */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
        color: '#f0f6fc',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '1.25rem',
        fontWeight: 800,
        letterSpacing: '-0.03em'
      }}>
        <div style={{
          background: user?.role === 'Admin' ? 'var(--accent-admin)' : 'var(--accent-primary)',
          color: '#000',
          padding: '0.35rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-smooth)'
        }}>
          <CheckSquare size={20} color={user?.role === 'Admin' ? '#fff' : '#000'} />
        </div>
        <span>AVIDUS <span style={{
          color: user?.role === 'Admin' ? 'var(--accent-admin)' : 'var(--accent-primary)',
          fontWeight: 500
        }}>TASK</span></span>
      </Link>

      {/* Navigation Options */}
      {user ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Navigation Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {user.role === 'Admin' ? (
              <>
                {/* Admin Menu */}
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isActive('/admin') ? 'var(--accent-admin)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: isActive('/admin') ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <BarChart2 size={16} /> Analytics
                </Link>
                <Link to="/admin/users" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isActive('/admin/users') ? 'var(--accent-admin)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: isActive('/admin/users') ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <Users size={16} /> Users
                </Link>
                <Link to="/admin/tasks" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isActive('/admin/tasks') ? 'var(--accent-admin)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: isActive('/admin/tasks') ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <ClipboardList size={16} /> Tasks
                </Link>
                <Link to="/admin/logs" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isActive('/admin/logs') ? 'var(--accent-admin)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: isActive('/admin/logs') ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <Activity size={16} /> Logs
                </Link>
              </>
            ) : (
              <>
                {/* Standard User Menu */}
                <Link to="/dashboard" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isActive('/dashboard') ? 'var(--accent-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: isActive('/dashboard') ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <ClipboardList size={16} /> My Tasks
                </Link>
              </>
            )}
          </div>

          {/* Vertical Divider */}
          <div style={{
            width: '1px',
            height: '24px',
            background: 'var(--border-color)'
          }} />

          {/* User Profile Info & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.2
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f6fc' }}>
                {user.name}
              </span>
              <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-user'}`} style={{
                fontSize: '0.625rem',
                padding: '0.1rem 0.4rem',
                marginTop: '0.2rem'
              }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Logout from Account"
            >
              <LogOut size={16} color="var(--accent-danger)" />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
