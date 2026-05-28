import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserMinus, Shield, ShieldAlert, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const { token, user: currentUser, API_URL } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch user list.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused by authorization server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Toggle user status handler
  const handleToggleStatus = async (user) => {
    setError('');
    setSuccess('');

    if (user._id === currentUser._id) {
      setError('Safety Override: You cannot deactivate your own administrative account!');
      return;
    }

    try {
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      const response = await fetch(`${API_URL}/admin/users/${user._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Successfully changed status for ${user.email} to ${newStatus}`);
        fetchUsers(); // Refresh list
      } else {
        setError(data.message || 'Failed to update user status.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Delete user handler
  const handleDeleteUser = async (user) => {
    setError('');
    setSuccess('');

    if (user._id === currentUser._id) {
      setError('Safety Override: You cannot delete your own administrative account!');
      return;
    }

    if (!window.confirm(`Warning: Deleting "${user.name}" will also cascade delete ALL of their created tasks. Proceed?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Successfully deleted user ${user.email} and all of their tasks.`);
        fetchUsers(); // Refresh list
      } else {
        setError(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-admin)' }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em', color: '#f0f6fc' }}>
          User Administration
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Perform security audits, toggle account activity states, and manage platform permissions.
        </p>
      </div>

      {/* Notifications */}
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

      {success && (
        <div className="glass-card" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'var(--accent-primary)',
          color: 'var(--accent-primary)',
          padding: '1rem',
          marginBottom: '2rem',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} /> {success}
          </span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* User Table listing */}
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
          <p>Downloading user profile database...</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Email Address</th>
                  <th>Role Scope</th>
                  <th>Status Guard</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser._id;
                  return (
                    <tr key={u._id} style={{ opacity: isSelf ? 0.95 : 1 }}>
                      {/* Name */}
                      <td style={{ fontWeight: 600, color: '#f0f6fc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isSelf && <Shield size={14} color="var(--accent-admin)" />}
                          <span>{u.name} {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-admin)', fontWeight: 'normal' }}>(You)</span>}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>

                      {/* Role */}
                      <td>
                        <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf}
                          className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}
                          style={{
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            border: 'none',
                            transition: 'var(--transition-smooth)'
                          }}
                          title={isSelf ? 'Self account is locked active' : `Click to change status to ${u.status === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          {u.status}
                        </button>
                      </td>

                      {/* Delete */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={isSelf}
                          className="btn btn-danger"
                          style={{
                            padding: '0.4rem',
                            borderRadius: '6px',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            opacity: isSelf ? 0.3 : 1
                          }}
                          title={isSelf ? 'Cannot delete self account' : 'Delete user and their tasks'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
