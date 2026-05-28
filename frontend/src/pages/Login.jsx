import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckSquare } from 'lucide-react';

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
      minHeight: '75vh',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '380px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--accent-blue)',
            color: '#0d1117',
            width: '38px',
            height: '38px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <CheckSquare size={20} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
            Sign In
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Enter your credentials to enter your workspace
          </p>
        </div>

        {/* Dynamic Errors */}
        {(formError || error) && (
          <div style={{
            background: 'rgba(255, 123, 114, 0.1)',
            border: '1px solid rgba(255, 123, 114, 0.2)',
            color: 'var(--accent-red)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <ShieldAlert size={14} style={{ flexShrink: 0 }} />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.7rem' }}>
            Sign In Account
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          New here?{' '}
          <Link to="/register" style={{
            color: 'var(--accent-blue)',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Register Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
