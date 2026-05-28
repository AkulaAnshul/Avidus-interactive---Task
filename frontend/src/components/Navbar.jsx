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
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      {/* Brand logo */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: 'var(--text-main)',
        fontSize: '1.1rem',
        fontWeight: 700
      }}>
        <div style={{
          background: user?.role === 'Admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
          color: '#0d1117',
          padding: '0.25rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckSquare size={16} color="#0d1117" />
        </div>
        <span>Avidus <span style={{
          color: user?.role === 'Admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
          fontWeight: 400
        }}>Task</span></span>
      </Link>

      {/* Nav menus */}
      {user ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {user.role === 'Admin' ? (
              <>
                <Link to="/admin" style={{
                  color: isActive('/admin') ? 'var(--accent-purple)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  background: isActive('/admin') ? 'rgba(188, 140, 255, 0.08)' : 'transparent',
                  transition: 'var(--transition)'
                }}>
                  Analytics
                </Link>
                <Link to="/admin/users" style={{
                  color: isActive('/admin/users') ? 'var(--accent-purple)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  background: isActive('/admin/users') ? 'rgba(188, 140, 255, 0.08)' : 'transparent',
                  transition: 'var(--transition)'
                }}>
                  Users
                </Link>
                <Link to="/admin/tasks" style={{
                  color: isActive('/admin/tasks') ? 'var(--accent-purple)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  background: isActive('/admin/tasks') ? 'rgba(188, 140, 255, 0.08)' : 'transparent',
                  transition: 'var(--transition)'
                }}>
                  Tasks
                </Link>
                <Link to="/admin/logs" style={{
                  color: isActive('/admin/logs') ? 'var(--accent-purple)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  background: isActive('/admin/logs') ? 'rgba(188, 140, 255, 0.08)' : 'transparent',
                  transition: 'var(--transition)'
                }}>
                  Logs
                </Link>
              </>
            ) : (
              <Link to="/dashboard" style={{
                color: isActive('/dashboard') ? 'var(--accent-blue)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.4rem 0.6rem',
                borderRadius: '4px',
                background: isActive('/dashboard') ? 'rgba(88, 166, 255, 0.08)' : 'transparent',
                transition: 'var(--transition)'
              }}>
                My Tasks
              </Link>
            )}
          </div>

          <div style={{
            width: '1px',
            height: '18px',
            background: 'var(--border-color)'
          }} />

          {/* User profile section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.1
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {user.name}
              </span>
              <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-user'}`} style={{
                fontSize: '0.55rem',
                padding: '0.05rem 0.25rem',
                marginTop: '0.15rem'
              }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Logout"
            >
              <LogOut size={13} color="var(--accent-red)" />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
