import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, CheckSquare } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { login, user, error, setError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Clean error on mount
  useEffect(() => {
    setError(null);
    setFormError('');
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all credentials.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      // Auth state will trigger redirect in useEffect
    } else {
      setFormError(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '420px',
        width: '100%',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Card Header logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--accent-primary)',
            color: '#000',
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <CheckSquare size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: '#f0f6fc' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Sign in to manage your tasks and access control
          </p>
        </div>

        {/* Dynamic Security Errors */}
        {(formError || error) && (
          <div style={{
            background: 'rgba(248, 81, 73, 0.12)',
            border: '1px solid rgba(248, 81, 73, 0.25)',
            color: 'var(--accent-danger)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dimmed)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dimmed)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            Sign In Account
          </button>
        </form>

        {/* Link to register */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          New to the platform?{' '}
          <Link to="/register" style={{
            color: 'var(--accent-primary)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
