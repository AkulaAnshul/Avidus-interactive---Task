import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Trash2, Check } from 'lucide-react';

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

    if (user.id === currentUser.id) {
      setError('Safety Override: You cannot deactivate your own account!');
      return;
    }

    try {
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      const response = await fetch(`${API_URL}/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Status for ${user.email} updated to ${newStatus}`);
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

    if (user.id === currentUser.id) {
      setError('Safety Override: You cannot delete your own admin account!');
      return;
    }

    if (!window.confirm(`Warning: Deleting "${user.name}" will delete ALL of their created tasks. Proceed?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Deleted user ${user.email} and all their tasks.`);
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
      {/* Header */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
          User Administration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Deactivate accounts, manage roles, and review platform access scopes.
        </p>
      </div>

      {/* Notifications */}
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

      {success && (
        <div className="glass-card" style={{
          borderColor: 'var(--accent-green)',
          color: 'var(--accent-green)',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={16} /> {success}
          </span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* User Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Syncing user list...</p>
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
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id}>
                      {/* Name */}
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {isSelf && <Shield size={12} color="var(--accent-purple)" />}
                          <span>{u.name} {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)' }}>(You)</span>}</span>
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
                            fontFamily: 'inherit'
                          }}
                          title={isSelf ? 'Self account is locked active' : 'Click to change status'}
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
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            opacity: isSelf ? 0.3 : 1
                          }}
                          title={isSelf ? 'Cannot delete self account' : 'Delete user'}
                        >
                          <Trash2 size={13} />
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
