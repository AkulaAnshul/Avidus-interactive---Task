import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ShieldAlert, CheckSquare, UserCheck } from 'lucide-react';

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
      minHeight: '85vh',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '450px',
        width: '100%',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Card Header logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '1.75rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: role === 'Admin' ? 'var(--accent-admin)' : 'var(--accent-primary)',
            color: '#fff',
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: role === 'Admin' ? 'var(--shadow-glow-admin)' : 'var(--shadow-glow)',
            transition: 'var(--transition-smooth)'
          }}>
            <UserCheck size={24} color={role === 'Admin' ? '#fff' : '#000'} />
          </div>
          <h2 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: '#f0f6fc' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Join Avidus to experience advanced RBAC tracking
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

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-dimmed)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="name-input"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

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
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password (min. 6 characters)
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

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="role-select">
              Select User Role
            </label>
            <select
              id="role-select"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                background: 'rgba(13, 17, 23, 0.8)',
                cursor: 'pointer'
              }}
            >
              <option value="User">Standard User (CRUD own tasks)</option>
              <option value="Admin">System Administrator (Total control)</option>
            </select>
          </div>

          <button
            type="submit"
            className={`btn ${role === 'Admin' ? 'btn-admin' : 'btn-primary'}`}
            style={{ width: '100%', padding: '0.85rem' }}
          >
            Register Account
          </button>
        </form>

        {/* Link back to login */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          Already registered?{' '}
          <Link to="/login" style={{
            color: role === 'Admin' ? 'var(--accent-admin)' : 'var(--accent-primary)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
