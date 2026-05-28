import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Circle, Trash2, Edit3, PlusCircle, Calendar, X, Save } from 'lucide-react';

const Dashboard = () => {
  const { token, user, API_URL } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for creating a task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // States for editing a task
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch only user's own tasks
  const fetchTasks = async () => {
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
        setError(data.message || 'Failed to retrieve tasks.');
      }
    } catch (err) {
      console.error(err);
      setError('Database offline or connection refused.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Create task handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and description.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setTitle('');
        setDescription('');
        setCreating(false);
        fetchTasks(); // Refresh list
      } else {
        setError(data.message || 'Task creation failed.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Toggle task status handler
  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const response = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchTasks();
      } else {
        setError(data.message || 'Status toggle failed.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Save edit handler
  const handleSaveEdit = async (taskId) => {
    if (!editTitle.trim() || !editDescription.trim()) {
      setError('Task fields cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle, description: editDescription })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setEditingTaskId(null);
        fetchTasks();
      } else {
        setError(data.message || 'Failed to edit task.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Start edit handler
  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  // Delete task handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchTasks();
      } else {
        setError(data.message || 'Task deletion failed.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  // Compute analytics locally for user progress bar
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="main-content">
      {/* Top Welcome Header & Analytics Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', letterSpacing: '-0.03em', color: '#f0f6fc' }}>
              My Workspace
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user?.name}</strong>. Manage and track your personal duties.
            </p>
          </div>
          <button
            onClick={() => setCreating(!creating)}
            className="btn btn-primary"
          >
            {creating ? <X size={16} /> : <PlusCircle size={16} />}
            {creating ? 'Collapse Form' : 'Add New Task'}
          </button>
        </div>

        {/* Workspace progress bar */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '0.45rem',
            color: 'var(--text-muted)'
          }}>
            <span>Task Completion Ratio</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{completionRate}% ({completedCount}/{totalCount})</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionRate}%`,
              height: '100%',
              background: 'var(--accent-primary)',
              boxShadow: 'var(--shadow-glow)',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
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

      {/* Creating Task Form section */}
      {creating && (
        <div className="glass-card" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="var(--accent-primary)" />
            Create A New Task
          </h3>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title-input">Task Title</label>
              <input
                id="task-title-input"
                type="text"
                className="form-input"
                placeholder="e.g. Finalize quarterly report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="task-desc-input">Task Description</label>
              <textarea
                id="task-desc-input"
                className="form-input"
                rows="3"
                placeholder="Describe details, criteria, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">
                Deploy Task
              </button>
              <button type="button" onClick={() => setCreating(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks listing view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <div style={{
            width: '30px',
            height: '30px',
            border: '2px solid rgba(16, 185, 129, 0.1)',
            borderTop: '2px solid var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p>Syncing task index...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-muted)'
        }}>
          <ClipboardList size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Tasks Recorded</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Your personal workspace is empty. Create your first task to track progress and register log activity.
          </p>
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            Initialize First Task
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {tasks.map((task) => (
            <div
              key={task._id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                boxShadow: task.status === 'Completed' ? '0 8px 32px 0 rgba(16, 185, 129, 0.05)' : 'var(--shadow-premium)',
                opacity: task.status === 'Completed' ? 0.85 : 1,
                transition: 'var(--transition-smooth)'
              }}
            >
              {editingTaskId === task._id ? (
                /* Edit State Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Edit Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Edit Description</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => handleSaveEdit(task._id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <Save size={14} /> Save
                    </button>
                    <button onClick={() => setEditingTaskId(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Card View */
                <>
                  <div>
                    {/* Card Header title / badge */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.2rem',
                        color: '#f0f6fc',
                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                        transition: 'var(--transition-smooth)'
                      }}>
                        {task.title}
                      </h3>
                      <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Description text */}
                    <p style={{
                      color: task.status === 'Completed' ? 'var(--text-dimmed)' : 'var(--text-muted)',
                      fontSize: '0.9rem',
                      whiteSpace: 'pre-wrap',
                      marginBottom: '1.5rem',
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none'
                    }}>
                      {task.description}
                    </p>
                  </div>

                  {/* Card Bottom status indicators / actions */}
                  <div style={{
                    borderTop: '1px solid rgba(48, 54, 61, 0.4)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {/* Timestamp */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-dimmed)'
                    }}>
                      <Calendar size={12} />
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Action button groupings */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Toggle status check box */}
                      <button
                        onClick={() => handleToggleStatus(task)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: task.status === 'Completed' ? 'var(--accent-primary)' : 'var(--text-dimmed)',
                          display: 'flex',
                          padding: '0.25rem',
                          transition: 'var(--transition-smooth)'
                        }}
                        title={task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {task.status === 'Completed' ? <CheckCircle size={18} /> : <Circle size={18} />}
                      </button>

                      {/* Edit option */}
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => handleStartEdit(task)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            padding: '0.25rem',
                            transition: 'var(--transition-smooth)'
                          }}
                          title="Edit Task Details"
                        >
                          <Edit3 size={18} />
                        </button>
                      )}

                      {/* Delete option */}
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--accent-danger)',
                          display: 'flex',
                          padding: '0.25rem',
                          transition: 'var(--transition-smooth)'
                        }}
                        title="Delete Task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
