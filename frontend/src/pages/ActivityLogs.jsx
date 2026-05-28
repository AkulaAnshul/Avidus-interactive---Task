import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, Search, RefreshCw, Calendar, Terminal, Network } from 'lucide-react';

const ActivityLogs = () => {
  const { token, API_URL } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLogs(data.logs);
      } else {
        setError(data.message || 'Failed to download activity log database.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused by the audit server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  // Map action labels to custom styles/badges
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'Login':
        return 'badge-user'; // sky blue
      case 'Task Creation':
        return 'badge-active'; // emerald
      case 'Task Update':
        return 'badge-pending'; // amber
      case 'Task Deletion':
        return 'badge-inactive'; // crimson
      default:
        return 'badge-secondary';
    }
  };

  // Filter logs based on search and action dropdown
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress || '').includes(searchQuery) ||
      log.role.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="main-content">
      {/* Header section */}
      <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-admin)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em', color: '#f0f6fc' }}>
              Platform Audit Trails
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Real-time monitoring of security logins, database mutations, and admin overrides.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Errors */}
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} /> {error}
          </span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-card" style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-dimmed)" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by user email, details, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Action:</span>
          <select
            className="form-input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              width: '180px',
              background: 'rgba(13, 17, 23, 0.8)',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Operations</option>
            <option value="Login">Logins only</option>
            <option value="Task Creation">Task Creations</option>
            <option value="Task Update">Task Updates</option>
            <option value="Task Deletion">Task Deletions</option>
          </select>
        </div>
      </div>

      {/* Logs View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <div style={{
            width: '30px',
            height: '30px',
            border: '2px solid rgba(139, 92, 246, 0.1)',
            borderTop: '2px solid var(--accent-admin)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p>Downloading platform audit indices...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <Activity size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Audit Entries Found</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>
            No logs matched the keyword search criteria. Run tasks or switch accounts to produce audit records.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Email</th>
                  <th>Scope</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    {/* Timestamp */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={12} color="var(--text-dimmed)" />
                        <span>
                          {new Date(log.timestamp).toLocaleDateString()}{' '}
                          <span style={{ color: '#fff', fontWeight: 500 }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ fontWeight: 600, color: '#f0f6fc' }}>{log.email}</td>

                    {/* Role */}
                    <td>
                      <span className={`badge ${log.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                        {log.role}
                      </span>
                    </td>

                    {/* Action Category */}
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Description Details */}
                    <td style={{ color: '#c9d1d9', fontSize: '0.875rem', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Terminal size={12} color="var(--text-dimmed)" />
                        <span>{log.details}</span>
                      </div>
                    </td>

                    {/* IP */}
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-dimmed)', fontFamily: 'monospace' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Network size={12} />
                        <span>{log.ipAddress}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simple spin styling injected */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ActivityLogs;
