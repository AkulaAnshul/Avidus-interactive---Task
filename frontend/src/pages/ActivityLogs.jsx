import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Search, RefreshCw, Calendar, Terminal, Network } from 'lucide-react';

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

  // Map action labels to custom flat styles
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'Login':
        return 'badge-user'; // sky blue
      case 'Task Creation':
        return 'badge-active'; // emerald green
      case 'Task Update':
        return 'badge-pending'; // amber orange
      case 'Task Deletion':
        return 'badge-inactive'; // crimson red
      default:
        return 'badge-secondary';
    }
  };

  // Filter logs
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
      {/* Header */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
              Platform Audit Trails
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Monitoring of user logins, task mutations, and administrative overrides.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem' }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Errors */}
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={16} /> {error}
          </span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-card" style={{
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search email, details, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Action:</span>
          <select
            className="form-input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: '150px', cursor: 'pointer' }}
          >
            <option value="All">All Operations</option>
            <option value="Login">Logins</option>
            <option value="Task Creation">Task Creations</option>
            <option value="Task Update">Task Updates</option>
            <option value="Task Deletion">Task Deletions</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Downloading platform audit indices...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.3rem' }}>No Audit Entries Found</h3>
          <p style={{ maxWidth: '320px', margin: '0 auto', fontSize: '0.8rem' }}>
            No logs matched the keyword search criteria.
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
                  <tr key={log.id}>
                    {/* Timestamp */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={10} color="var(--text-muted)" />
                        <span>
                          {new Date(log.timestamp).toLocaleDateString()}{' '}
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ fontWeight: 600 }}>{log.email}</td>

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

                    {/* Description */}
                    <td style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Terminal size={10} color="var(--text-muted)" />
                        <span>{log.details}</span>
                      </div>
                    </td>

                    {/* IP */}
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Network size={10} />
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
