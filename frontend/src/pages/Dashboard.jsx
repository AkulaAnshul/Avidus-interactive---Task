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
      {/* Top Welcome Header */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
              My Workspace
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Welcome back, <strong>{user?.name}</strong>. Create and manage your personal duties.
            </p>
          </div>
          <button
            onClick={() => setCreating(!creating)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            {creating ? <X size={14} /> : <PlusCircle size={14} />}
            {creating ? 'Collapse Form' : 'Add New Task'}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: '0.3rem',
            color: 'var(--text-muted)'
          }}>
            <span>Task Completion Ratio</span>
            <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{completionRate}% ({completedCount}/{totalCount})</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg-input)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionRate}%`,
              height: '100%',
              background: 'var(--accent-blue)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Dynamic Errors notification */}
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

      {/* Creating Task Form section */}
      {creating && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={16} color="var(--accent-blue)" />
            Create A New Task
          </h3>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title-input">Task Title</label>
              <input
                id="task-title-input"
                type="text"
                className="form-input"
                placeholder="e.g. Finalize report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="task-desc-input">Task Description</label>
              <textarea
                id="task-desc-input"
                className="form-input"
                rows="2"
                placeholder="Describe details, criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Syncing task index...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          color: 'var(--text-muted)'
        }}>
          <ClipboardList size={38} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.3rem' }}>No Tasks Recorded</h3>
          <p style={{ maxWidth: '360px', margin: '0 auto 1.25rem auto', fontSize: '0.8rem' }}>
            Your personal workspace is empty. Create your first task to track progress!
          </p>
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            Initialize First Task
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {tasks.map((task) => (
            <div
              key={task._id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: task.status === 'Completed' ? 'rgba(63, 185, 80, 0.3)' : 'var(--border-color)',
                opacity: task.status === 'Completed' ? 0.8 : 1,
                marginBottom: 0
              }}
            >
              {editingTaskId === task._id ? (
                /* Edit State Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
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
                      rows="2"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <button onClick={() => handleSaveEdit(task._id)} className="btn btn-primary" style={{ padding: '0.35rem 0.7rem' }}>
                      <Save size={12} /> Save
                    </button>
                    <button onClick={() => setEditingTaskId(null)} className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem' }}>
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Card View */
                <>
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.05rem',
                        color: 'var(--text-main)',
                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none'
                      }}>
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
                      marginBottom: '1rem',
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none'
                    }}>
                      {task.description}
                    </p>
                  </div>

                  <div style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.65rem',
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
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* Check toggle */}
                      <button
                        onClick={() => handleToggleStatus(task)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: task.status === 'Completed' ? 'var(--accent-green)' : 'var(--text-muted)',
                          display: 'flex',
                          padding: '0.15rem'
                        }}
                        title={task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {task.status === 'Completed' ? <CheckCircle size={15} /> : <Circle size={15} />}
                      </button>

                      {/* Edit */}
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => handleStartEdit(task)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            padding: '0.15rem'
                          }}
                          title="Edit task"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--accent-red)',
                          display: 'flex',
                          padding: '0.15rem'
                        }}
                        title="Delete task"
                      >
                        <Trash2 size={15} />
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
