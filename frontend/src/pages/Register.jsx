import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [formError, setFormError] = useState('');

  const { register, user, error, setError } = useAuth();
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

    if (!name || !email || !password) {
      setFormError('Please fill in all requested fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const result = await register(name, email, password, role);
    if (result.success) {
      // Auth state will trigger redirect in useEffect
    } else {
      setFormError(result.message || 'Registration failed. Try using a different email.');
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
        maxWidth: '400px',
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
            background: role === 'Admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
            color: '#0d1117',
            width: '38px',
            height: '38px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
            transition: 'var(--transition)'
          }}>
            <UserCheck size={20} color="#0d1117" />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
            Register
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Create an account to manage tasks and log activity
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

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">
              Full Name
            </label>
            <input
              id="name-input"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password (min. 6 chars)
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

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="role-select">
              User Role Scope
            </label>
            <select
              id="role-select"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="User">Standard User (CRUD tasks)</option>
              <option value="Admin">Administrator (Global Audit)</option>
            </select>
          </div>

          <button
            type="submit"
            className={`btn ${role === 'Admin' ? 'btn-admin' : 'btn-primary'}`}
            style={{ width: '100%', padding: '0.7rem' }}
          >
            Register Account
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          Registered?{' '}
          <Link to="/login" style={{
            color: role === 'Admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
