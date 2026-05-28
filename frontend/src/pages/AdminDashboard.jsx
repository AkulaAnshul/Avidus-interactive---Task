import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, ClipboardList, CheckCircle, Clock, Shield, ArrowRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const { token, user, API_URL } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  // Data mapping for Pie Chart visualization
  const getChartData = () => {
    if (!metrics) return [];
    return [
      { name: 'Completed Tasks', value: metrics.completedTasks },
      { name: 'Pending Tasks', value: metrics.pendingTasks }
    ];
  };

  // Cohesive HSL colors matching our CSS tokens
  const COLORS = ['#10b981', '#f59e0b']; // emerald and amber

  return (
    <div className="main-content">
      {/* Top Welcome Card */}
      <div className="glass-card" style={{
        marginBottom: '2rem',
        borderLeft: '4px solid var(--accent-admin)',
        boxShadow: 'var(--shadow-glow-admin)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={28} color="var(--accent-admin)" />
          <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em', color: '#f0f6fc' }}>
            Security Administration Control
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.45rem' }}>
          Welcome, Administrator <strong style={{ color: '#fff' }}>{user?.name}</strong>. Access the central oversight deck for database metrics, user status locks, and action audit records.
        </p>
      </div>

      {/* Dynamic Errors notification */}
      {error && (
        <div className="glass-card" style={{
          background: 'rgba(248, 81, 73, 0.1)',
          borderColor: 'var(--accent-danger)',
          color: 'var(--accent-danger)',
          padding: '1rem',
          marginBottom: '2rem',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{
            width: '30px',
            height: '30px',
            border: '2px solid rgba(139, 92, 246, 0.1)',
            borderTop: '2px solid var(--accent-admin)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p>Compiling system-wide aggregates...</p>
        </div>
      ) : (
        <>
          {/* Metrics grids */}
          <div className="grid-cols-4" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Total Users card */}
            <div className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#38bdf8',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
                <h3 style={{ fontSize: '1.75rem', color: '#fff', marginTop: '0.1rem' }}>{metrics?.totalUsers}</h3>
              </div>
            </div>

            {/* Total Tasks card */}
            <div className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'rgba(139, 92, 246, 0.08)',
                color: 'var(--accent-admin)',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClipboardList size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</span>
                <h3 style={{ fontSize: '1.75rem', color: '#fff', marginTop: '0.1rem' }}>{metrics?.totalTasks}</h3>
              </div>
            </div>

            {/* Completed Tasks card */}
            <div className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
              borderColor: 'rgba(16, 185, 129, 0.25)'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                color: 'var(--accent-primary)',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span>
                <h3 style={{ fontSize: '1.75rem', color: '#fff', marginTop: '0.1rem' }}>{metrics?.completedTasks}</h3>
              </div>
            </div>

            {/* Pending Tasks card */}
            <div className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
              borderColor: 'rgba(245, 158, 11, 0.25)'
            }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                color: 'var(--accent-warning)',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span>
                <h3 style={{ fontSize: '1.75rem', color: '#fff', marginTop: '0.1rem' }}>{metrics?.pendingTasks}</h3>
              </div>
            </div>
          </div>

          {/* Graph & Action Grid */}
          <div className="grid-cols-2">
            {/* Visual Analytics Chart */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '360px' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                System Duty Status Breakdown
              </h3>
              {metrics?.totalTasks > 0 ? (
                <div style={{ flex: 1, minHeight: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(13, 17, 23, 0.9)', 
                          border: '1px solid var(--border-color)', 
                          color: '#fff', 
                          borderRadius: '8px' 
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dimmed)' }}>
                  No tasks recorded in database to render chart statistics.
                </div>
              )}
            </div>

            {/* Quick Administrator Actions panel */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '360px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  Platform Navigation Desk
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Perform operational overrides, manage access permissions, and investigate activity audit trails.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                {/* User management route */}
                <Link to="/admin/users" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.04)',
                  border: '1px solid rgba(56, 189, 248, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'var(--transition-smooth)'
                }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.04)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.1)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={20} color="#38bdf8" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Configure User Accounts</span>
                  </div>
                  <ArrowRight size={16} color="#38bdf8" />
                </Link>

                {/* Task Monitor route */}
                <Link to="/admin/tasks" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.04)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'var(--transition-smooth)'
                }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)'; e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.04)'; e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ClipboardList size={20} color="var(--accent-admin)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Monitor Duty Assignments</span>
                  </div>
                  <ArrowRight size={16} color="var(--accent-admin)" />
                </Link>

                {/* Logs Monitor route */}
                <Link to="/admin/logs" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'var(--transition-smooth)'
                }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={20} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Review Security Logs</span>
                  </div>
                  <ArrowRight size={16} color="var(--accent-primary)" />
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
