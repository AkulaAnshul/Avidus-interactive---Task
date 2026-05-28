import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShieldAlert, CheckCircle, Clock, Search, Calendar, User } from 'lucide-react';

const TaskMonitoring = () => {
  const { token, API_URL } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAllTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTasks(data.tasks);
      } else {
        setError(data.message || 'Failed to sync task index.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused by the authorization backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, [token]);

  // Admin delete task handler
  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you absolutely sure you want to delete task "${taskTitle}"? This action will record an administrative audit log.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Task "${taskTitle}" deleted successfully.`);
        fetchAllTasks(); // Refresh index
      } else {
        setError(data.message || 'Failed to delete task.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Filter tasks based on Search and Status select
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.creator?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.creator?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="main-content">
      {/* Header section */}
      <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-admin)' }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em', color: '#f0f6fc' }}>
          Global Task Monitor
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Real-time oversight of system-wide assignments. Filter, search, and delete non-compliant duties.
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
            <CheckSquare size={18} color="var(--accent-primary)" /> {success}
          </span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Search and Filter controls bar */}
      <div className="glass-card" style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Search input */}
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
            placeholder="Search by task title, description, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '150px',
              background: 'rgba(13, 17, 23, 0.8)',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending Only</option>
            <option value="Completed">Completed Only</option>
          </select>
        </div>
      </div>

      {/* Main Task List */}
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
          <p>Syncing global task index...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <Clock size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Tasks Match Search</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>
            No records matched your search parameters. Try altering your keyword filter or switching category states.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)',
                boxShadow: 'var(--shadow-premium)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div>
                {/* Header title / status badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#f0f6fc', fontWeight: 600 }}>
                    {task.title}
                  </h3>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                    {task.status}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1.5rem'
                }}>
                  {task.description}
                </p>
              </div>

              {/* Bottom Owner Detail & Admin Actions */}
              <div style={{
                borderTop: '1px solid rgba(48, 54, 61, 0.4)',
                paddingTop: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {/* Owner details */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <User size={14} color="var(--accent-admin)" />
                  <span>
                    Owner:{' '}
                    <strong style={{ color: '#fff' }}>{task.creator?.name || 'Unknown User'}</strong>{' '}
                    <span style={{ color: 'var(--text-dimmed)' }}>({task.creator?.email || 'N/A'})</span>
                  </span>
                </div>

                {/* Timestamp & Admin Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-dimmed)'
                  }}>
                    <Calendar size={12} />
                    <span>Seeded: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task._id, task.title)}
                    className="btn btn-danger"
                    style={{
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px'
                    }}
                    title="Administrative Delete"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskMonitoring;
