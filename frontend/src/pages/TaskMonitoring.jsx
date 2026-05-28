import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShieldAlert, Check, Calendar, User } from 'lucide-react';

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
    if (!window.confirm(`Are you absolutely sure you want to delete task "${taskTitle}"?`)) {
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
        fetchAllTasks(); // Refresh list
      } else {
        setError(data.message || 'Failed to delete task.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Filter tasks
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
      {/* Header */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
          Global Task Monitor
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Oversight of system-wide assignments. Search, filter by status, and delete duty records.
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

      {/* Filters bar */}
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
            placeholder="Search title, description, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '130px', cursor: 'pointer' }}
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Syncing task indices...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.3rem' }}>No Tasks Match Search</h3>
          <p style={{ maxWidth: '320px', margin: '0 auto', fontSize: '0.8rem' }}>
            No records matched your search parameters. Try altering your keywords.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: task.status === 'Completed' ? 'rgba(63, 185, 80, 0.25)' : 'var(--border-color)',
                marginBottom: 0
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {task.title}
                  </h3>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`} style={{ flexShrink: 0 }}>
                    {task.status}
                  </span>
                </div>

                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1rem'
                }}>
                  {task.description}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {/* Creator Metadata */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <User size={12} color="var(--accent-purple)" />
                  <span>
                    Owner: <strong>{task.creator?.name || 'Unknown User'}</strong> <span style={{ fontSize: '0.7rem' }}>({task.creator?.email || 'N/A'})</span>
                  </span>
                </div>

                {/* Footer details */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)'
                  }}>
                    <Calendar size={10} />
                    <span>Seeded: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    className="btn btn-danger"
                    style={{
                      padding: '0.3rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '4px'
                    }}
                  >
                    <Trash2 size={11} /> Delete
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
