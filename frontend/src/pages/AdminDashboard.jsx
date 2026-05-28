import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, ClipboardList, CheckCircle, Clock, Shield, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const { token, user, API_URL } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMetrics(data.analytics);
      } else {
        setError(data.message || 'Failed to download system metrics.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused by the analytics server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  // Calculations for platform performance
  const totalTasks = metrics?.totalTasks || 0;
  const completedTasks = metrics?.completedTasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="main-content">
      {/* Header */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={24} color="var(--accent-purple)" />
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
            Administrative Control Panel
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Oversight dashboard for system aggregates, user status flags, and activity log trails.
        </p>
      </div>

      {/* Dynamic Errors */}
      {error && (
        <div className="glass-card" style={{
          borderColor: 'var(--accent-red)',
          color: 'var(--accent-red)',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Compiling system-wide aggregates...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Total Users */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', marginBottom: 0 }}>
              <div style={{
                background: 'rgba(88, 166, 255, 0.08)',
                color: 'var(--accent-blue)',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Users</span>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.1rem', marginBottom: 0 }}>{metrics?.totalUsers}</h3>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', marginBottom: 0 }}>
              <div style={{
                background: 'rgba(188, 140, 255, 0.08)',
                color: 'var(--accent-purple)',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Tasks</span>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.1rem', marginBottom: 0 }}>{metrics?.totalTasks}</h3>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', marginBottom: 0, borderColor: 'rgba(63, 185, 80, 0.25)' }}>
              <div style={{
                background: 'rgba(63, 185, 80, 0.08)',
                color: 'var(--accent-green)',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Completed</span>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.1rem', marginBottom: 0 }}>{metrics?.completedTasks}</h3>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', marginBottom: 0, borderColor: 'rgba(240, 136, 62, 0.25)' }}>
              <div style={{
                background: 'rgba(240, 136, 62, 0.08)',
                color: 'var(--accent-orange)',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex'
              }}>
                <Clock size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pending</span>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.1rem', marginBottom: 0 }}>{metrics?.pendingTasks}</h3>
              </div>
            </div>
          </div>

          {/* Graph (basic CSS progress bar) and Actions in a 2-column grid */}
          <div className="grid-cols-2">
            {/* Flat Analytics Chart Block */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                Database Task Completion Metric
              </h3>
              {totalTasks > 0 ? (
                <div style={{ padding: '1rem 0' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tasks Resolved Ratio</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{completionRate}%</span>
                  </div>
                  {/* Outer Bar */}
                  <div style={{
                    width: '100%',
                    height: '16px',
                    background: 'var(--bg-input)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {/* Inner progress bar */}
                    <div style={{
                      width: `${completionRate}%`,
                      height: '100%',
                      background: 'var(--accent-green)',
                      transition: 'width 0.4s ease',
                      borderRadius: '8px'
                    }} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
                    {completedTasks} out of {totalTasks} duties successfully resolved.
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                  No tasks recorded in database to compute metrics.
                </p>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  Platform Operations Menu
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  Perform administration duties, locks, audits, and oversight.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/admin/users" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(88, 166, 255, 0.04)',
                  border: '1px solid rgba(88, 166, 255, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.85rem'
                }}>
                  <span>Configure User Accounts</span>
                  <ArrowRight size={14} color="var(--accent-blue)" />
                </Link>

                <Link to="/admin/tasks" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(188, 140, 255, 0.04)',
                  border: '1px solid rgba(188, 140, 255, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.85rem'
                }}>
                  <span>Monitor Global Duties</span>
                  <ArrowRight size={14} color="var(--accent-purple)" />
                </Link>

                <Link to="/admin/logs" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(63, 185, 80, 0.04)',
                  border: '1px solid rgba(63, 185, 80, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.85rem'
                }}>
                  <span>Review Audit Logs</span>
                  <ArrowRight size={14} color="var(--accent-green)" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
