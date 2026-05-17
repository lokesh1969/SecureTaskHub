import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from '../utils/axios';
import { toast } from 'react-toastify';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: { email: string };
  priority: string;
}

const priorityBadge = (priority: string) => {
  if (priority === 'CRITICAL' || priority === 'HIGH')
    return <span className="badge badge-alert"><span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>{priority}</span>;
  if (priority === 'MEDIUM')
    return <span className="badge badge-warn"><span className="material-symbols-outlined" style={{ fontSize: 12 }}>flag</span>{priority}</span>;
  return <span className="badge badge-secure"><span className="material-symbols-outlined" style={{ fontSize: 12 }}>security</span>{priority}</span>;
};

const columns: { id: 'TODO' | 'IN_PROGRESS' | 'DONE'; label: string; icon: string }[] = [
  { id: 'TODO',        label: 'Pending / To Do', icon: 'radio_button_unchecked' },
  { id: 'IN_PROGRESS', label: 'In Progress',     icon: 'pending' },
  { id: 'DONE',        label: 'Done',             icon: 'check_circle' },
];

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch {
      toast.error('Failed to load task matrix');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    setTasks(prev => prev.map(t =>
      t.id === draggableId ? { ...t, status: destination.droppableId as Task['status'] } : t
    ));
    try {
      await api.put(`/tasks/${draggableId}/status`, { status: destination.droppableId });
      toast.success('Task protocol updated');
    } catch {
      toast.error('Failed to update task status');
      fetchTasks();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.post('/tasks', { title: newTitle.trim(), status: 'TODO', priority: newPriority });
      setNewTitle('');
      fetchTasks();
      toast.success('Task initiated');
    } catch {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="section-heading" style={{ marginBottom: 32 }}>
        <h2>Task Matrix</h2>
        <p>Drag tasks between columns to update their protocol status.</p>
      </div>

      {/* Create Task */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Initiate new task..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          style={{ flex: 1, minWidth: 240, maxWidth: 480 }}
        />
        <select
          className="form-input"
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="CRITICAL">Critical Priority</option>
        </select>
        <button type="submit" className="btn-primary" disabled={creating}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          {creating ? 'Initiating...' : 'Initiate Task'}
        </button>
      </form>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            const isActive = col.id === 'IN_PROGRESS';
            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="kanban-column"
                    style={col.id === 'DONE' ? { opacity: 0.75 } : undefined}
                  >
                    <div className={`kanban-column-header${isActive ? ' active' : ''}`}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{col.icon}</span>
                        {col.label}
                      </h3>
                      <span className="kanban-column-count">{colTasks.length}</span>
                    </div>

                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card${isActive ? ' in-progress' : ''}`}
                          >
                            <div>{priorityBadge(task.priority)}</div>
                            <p className="kanban-card-title">{task.title}</p>
                            {task.description && (
                              <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>{task.description}</p>
                            )}
                            <div className="kanban-card-footer">
                              <div className="kanban-avatar">
                                {task.assignee?.email?.slice(0, 2).toUpperCase() ?? 'OP'}
                              </div>
                              <span style={{ fontSize: 10, color: task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'var(--color-error)' : 'var(--color-on-surface-variant)' }}>
                                {task.assignee?.email ?? '—'}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                        <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>No tasks</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
};
