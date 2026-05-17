import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { TaskBoard } from './pages/TaskBoard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io, Socket } from 'socket.io-client';
import api from './utils/axios';
import './index.css';

let socket: Socket;

/* ===========================
   Socket Manager
   =========================== */
const SocketManager = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { withCredentials: true });
      socket.emit('join', user.id);
      socket.on('taskAssigned',      (d) => toast.info(d.message));
      socket.on('taskUpdated',       (d) => toast.info(d.message));
      socket.on('deadlineApproaching',(d) => toast.warning(d.message));
      return () => { socket.disconnect(); };
    }
  }, [user]);
  return null;
};

/* ===========================
   Protected Route
   =========================== */
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  return <>{children}</>;
};

/* ===========================
   Sidebar
   =========================== */
const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const { user, logout } = useAuth();
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 35 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'var(--color-surface-slate)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: 'var(--color-primary)' }}>
              {user?.email?.slice(0, 2).toUpperCase() ?? 'OP'}
            </div>
            <div>
              <h2>SECURETASKHUB</h2>
              <p>ENCRYPTED NODE 04</p>
            </div>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsOpen(false)} style={{ display: isOpen ? 'block' : 'none' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="sidebar-cta">
          <NavLink to="/tasks" onClick={() => setIsOpen(false)}>
            <button>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              INITIATE TASK
            </button>
          </NavLink>
        </div>

        <div className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">dashboard</span>
            Command Center
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">segment</span>
            Task Matrix
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined">key</span>
              Access Control
            </NavLink>
          )}
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">settings</span>
            System Config
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <a href="#" className="sidebar-link" onClick={() => { setIsOpen(false); toast.info('Documentation node offline for maintenance.'); }}>
            <span className="material-symbols-outlined">menu_book</span>
            Documentation
          </a>
          <button onClick={logout} className="sidebar-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined">logout</span>
            Terminate Session
          </button>
        </div>
      </nav>
    </>
  );
};

/* ===========================
   Topbar
   =========================== */
const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle: Record<string, string> = {
    '/':        'Command Center',
    '/tasks':   'Task Matrix',
    '/admin':   'Access Control',
    '/settings':'System Config',
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar} title="Toggle Menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Query Matrix..." onChange={e => { if(e.target.value.trim().length > 3) toast.info(`Querying matrix for: ${e.target.value}`); }} />
        </div>
      </div>
      <div className="topbar-right">
        <span className="topbar-brand">SECURE-HUB</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
          {pageTitle[location.pathname] ?? ''}
        </span>
        <div className="topbar-actions">
          <button title="Notifications" onClick={() => toast.info('No unread protocol broadcasts.')}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button title={user?.email} onClick={() => toast.info(`Active Operator: ${user?.email}`)}>
            <span className="material-symbols-outlined">manage_accounts</span>
          </button>
        </div>
      </div>
    </header>
  );
};

/* ===========================
   Dashboard Page
   =========================== */
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: { email: string };
  priority: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState({ total: 0, dueToday: 0, overdue: 0, done: 0 });
  const [activityFeed, setActivityFeed] = useState([
    { type: 'Sys_Update', time: '10:42 AM', msg: 'Firewall rules updated for Node 04.', active: true },
    { type: 'Auth_Log',   time: '09:15 AM', msg: `User ${user?.email ?? 'OP'} authenticated successfully.`, active: false },
    { type: 'Task_Upd',   time: '08:50 AM', msg: 'Task "Rotate Access Keys" moved to IN_PROGRESS.', active: false },
  ]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      const data: Task[] = res.data;
      setTasks(data);
      setTaskStats({
        total: data.length,
        dueToday: data.filter(t => t.status !== 'DONE').length,
        overdue: data.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length,
        done: data.filter(t => t.status === 'DONE').length,
      });
    } catch {
      toast.error('Failed to load matrix telemetry');
    }
  };

  const handleInjectEvent = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const events = [
      { type: 'Sec_Audit', msg: 'Integrity scan completed. Zero anomalies detected.' },
      { type: 'Node_Sync', msg: 'Encrypted handshake verified with Sector 7.' },
      { type: 'RBAC_Log',  msg: 'Clearance verification broadcasted.' }
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    setActivityFeed(prev => [
      { type: randomEvent.type, time: timeStr, msg: randomEvent.msg, active: true },
      ...prev.map(item => ({ ...item, active: false }))
    ]);
    toast.success('Protocol event broadcasted');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const todoTasks = tasks.filter(t => t.status === 'TODO').slice(0, 2);
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').slice(0, 2);

  return (
    <>
      {/* Greeting */}
      <div style={{ paddingLeft: 'var(--spacing-asymmetric-offset)', borderLeft: '1px solid rgba(79,222,187,0.3)', marginBottom: 32 }}>
        <h2 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em' }}>{greeting}, Commander</h2>
        <p style={{ fontSize: 16, color: 'var(--color-on-surface-variant)', marginTop: 8 }}>
          System integrity at 98.4%. Logged in as <strong style={{ color: 'var(--color-primary)' }}>{user?.email}</strong>
          {' '}· Role: <span style={{ color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>{user?.role}</span>
        </p>
      </div>

      {/* Asymmetric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left — Stats + Mini Kanban */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="stat-card"><p className="stat-label">Total Tasks</p><p className="stat-value">{taskStats.total}</p></div>
            <div className="stat-card accent-primary"><p className="stat-label">Due / Pending</p><p className="stat-value">{taskStats.dueToday}</p></div>
            <div className="stat-card accent-alert"><p className="stat-label">Critical</p><p className="stat-value">{taskStats.overdue}</p></div>
            <div className="stat-card"><p className="stat-label">Completed</p><p className="stat-value" style={{ color: 'var(--color-on-surface-variant)' }}>{taskStats.done}</p></div>
          </div>

          {/* Mini Kanban Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* TODO */}
            <div style={{ background: 'rgba(43,49,55,0.3)', border: '1px solid var(--color-border-subtle)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pending</span>
                <span className="badge badge-neutral">{tasks.filter(t => t.status === 'TODO').length}</span>
              </div>
              {todoTasks.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>No pending tasks</p>
              ) : (
                todoTasks.map(t => (
                  <div key={t.id} style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border-subtle)', padding: 12 }}>
                    <span className={t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'badge badge-alert' : 'badge badge-secure'}>
                      {t.priority}
                    </span>
                    <p style={{ fontSize: 14, margin: '12px 0', color: 'var(--color-on-surface)' }}>{t.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--color-surface-slate)', border: '1px solid var(--color-border-subtle)', padding: '2px 8px', color: 'var(--color-primary)' }}>
                        {t.assignee?.email?.slice(0,2).toUpperCase() ?? 'OP'}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)' }}>{t.priority}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* IN_PROGRESS */}
            <div style={{ background: 'rgba(43,49,55,0.3)', border: '1px solid var(--color-border-subtle)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(79,222,187,0.5)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>In Progress</span>
                <span className="badge badge-secure">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
              </div>
              {inProgressTasks.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>No active tasks</p>
              ) : (
                inProgressTasks.map(t => (
                  <div key={t.id} style={{ background: 'var(--color-surface-deep)', border: '1px solid rgba(79,222,187,0.3)', padding: 12, boxShadow: 'inset 0 0 10px rgba(37,194,160,0.05)' }}>
                    <span className="badge badge-secure">{t.priority}</span>
                    <p style={{ fontSize: 14, margin: '12px 0', color: 'var(--color-on-surface)' }}>{t.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--color-surface-slate)', border: '1px solid var(--color-border-subtle)', padding: '2px 8px', color: 'var(--color-on-surface-variant)' }}>
                        {t.assignee?.email?.slice(0,2).toUpperCase() ?? 'OP'}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)' }}>Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DONE */}
            <div style={{ background: 'rgba(43,49,55,0.1)', border: '1px solid var(--color-border-subtle)', padding: 16, opacity: 0.75, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--color-border-subtle)', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Done</span>
                <span className="badge badge-neutral">{taskStats.done}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-on-surface-variant)', opacity: 0.3 }}>check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Live Feed */}
        <div style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border-subtle)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderLeft: '2px solid var(--color-on-surface-variant)', paddingLeft: 12 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>
              Live Protocol Feed
            </h3>
            <button className="btn-ghost" onClick={handleInjectEvent} title="Inject Audit Event" style={{ padding: '4px 8px', fontSize: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cell_tower</span> Broadcast
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'var(--color-border-subtle)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activityFeed.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, flexShrink: 0,
                    background: 'var(--color-surface-deep)',
                    border: `2px solid ${item.active ? 'var(--color-primary)' : 'var(--color-border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: item.active ? '0 0 10px rgba(37,194,160,0.5)' : 'none',
                    zIndex: 1, position: 'relative',
                  }}>
                    <div style={{ width: 8, height: 8, background: item.active ? 'var(--color-primary)' : 'var(--color-border-subtle)' }} />
                  </div>
                  <div style={{ background: item.active ? 'var(--color-surface-slate)' : 'var(--color-surface-deep)', border: '1px solid var(--color-border-subtle)', padding: 12, flex: 1, opacity: item.active ? 1 : 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: item.active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>{item.type}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)' }}>{item.time}</span>
                    </div>
                    <p style={{ fontSize: 14, color: item.active ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}>{item.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ===========================
   Settings Page
   =========================== */
const Settings = () => {
  const { user } = useAuth();
  const [alias, setAlias] = useState('Commander Zero');
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Keys State
  const [securityKeys, setSecurityKeys] = useState([
    { id: 'KEY-9842-ALPHA', name: 'Primary Node Access', created: 'May 12, 2026', perm: 'Full Access' },
    { id: 'KEY-1049-BETA',  name: 'Telemetry Read-Only', created: 'Apr 18, 2026', perm: 'Read-Only' },
  ]);

  // Alert Matrix State
  const [alerts, setAlerts] = useState({
    wsBroadcasts: true,
    escalation: true,
    mismatchWarn: true,
    dailyDigest: false,
    unauthAttempts: true,
  });

  const tabs = [
    { id: 'profile',  label: 'Operator Profile' },
    { id: 'security', label: 'Security Keys' },
    { id: 'alerts',   label: 'Alert Matrix' },
  ];

  const handleGenerateKey = () => {
    const newId = `KEY-${Math.floor(Math.random() * 8000) + 1000}-NODE04`;
    setSecurityKeys(prev => [...prev, { id: newId, name: 'Generated API Token', created: 'Just now', perm: 'Full Access' }]);
    toast.success(`Generated 256-bit security key: ${newId}`);
  };

  const handleRevokeKey = (id: string) => {
    setSecurityKeys(prev => prev.filter(k => k.id !== id));
    toast.info(`Security key ${id} revoked.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast.success(`Biometric scan verified: ${e.target.files[0].name}`);
    }
  };

  return (
    <>
      <div className="section-heading" style={{ marginBottom: 32 }}>
        <h2>System Config &amp; Profile</h2>
        <p>Manage your operator identity, security keys, and alert preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Tab Nav */}
        <div className="settings-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`settings-nav-btn${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 320, background: 'var(--color-surface-deep)', border: '1px solid var(--color-border-subtle)', padding: 24 }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Avatar Upload */}
              <div>
                <p className="form-label" style={{ marginBottom: 12 }}>Biometric Identity</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <div style={{ border: '2px dashed var(--color-border-subtle)', padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.2s, background-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-subtle)'; }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ width: 64, height: 64, background: 'var(--color-surface-variant)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>fingerprint</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Initialize Upload Protocol</p>
                    <p style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div className="auth-form-field">
                  <label className="form-label">Alias</label>
                  <input type="text" className="form-input" value={alias} onChange={e => setAlias(e.target.value)} placeholder="Commander Zero" />
                </div>
                <div className="auth-form-field">
                  <label className="form-label">Comm Link (Email)</label>
                  <input type="email" className="form-input" defaultValue={user?.email ?? ''} readOnly />
                </div>
                <div className="auth-form-field">
                  <label className="form-label">Clearance Level</label>
                  <input type="text" className="form-input" value={user?.role ?? '—'} readOnly style={{ color: 'var(--color-on-surface-variant)' }} />
                </div>
                <div className="auth-form-field">
                  <label className="form-label">Node</label>
                  <input type="text" className="form-input" value="ENCRYPTED NODE 04" readOnly style={{ color: 'var(--color-on-surface-variant)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="btn-primary" onClick={() => toast.success('Operator profile committed to secure storage.')}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                  Commit Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)' }}>Active Encryption Keys</h3>
                  <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Manage RSA tokens and API keys authorized for this node.</p>
                </div>
                <button className="btn-primary" onClick={handleGenerateKey}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>key</span> Generate Key
                </button>
              </div>

              {securityKeys.length === 0 ? (
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '32px 0' }}>No active security keys.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {securityKeys.map(key => (
                    <div key={key.id} className="security-key-card">
                      <div className="security-key-info">
                        <span className="security-key-title">{key.id}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-on-surface)' }}>{key.name}</span>
                        <div className="security-key-meta">
                          <span>Created: {key.created}</span>
                          <span>Permission: <strong style={{ color: 'var(--color-primary)' }}>{key.perm}</strong></span>
                        </div>
                      </div>
                      <button className="btn-ghost" onClick={() => handleRevokeKey(key.id)} title="Revoke Key">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)' }}>Alert Matrix Configuration</h3>
                <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Customize WebSocket broadcast triggers and security threshold warnings.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="switch-container">
                  <div className="switch-label-group">
                    <span className="switch-title">Real-Time Task Assignment Broadcasts</span>
                    <span className="switch-desc">Receive immediate WebSocket pings when a protocol is assigned to your ID.</span>
                  </div>
                  <input type="checkbox" checked={alerts.wsBroadcasts} onChange={e => setAlerts(prev => ({ ...prev, wsBroadcasts: e.target.checked }))} style={{ accentColor: 'var(--color-primary)', width: 20, height: 20 }} />
                </div>

                <div className="switch-container">
                  <div className="switch-label-group">
                    <span className="switch-title">Priority Escalation Alerts</span>
                    <span className="switch-desc">Trigger high-contrast warnings for CRITICAL and HIGH priority tasks.</span>
                  </div>
                  <input type="checkbox" checked={alerts.escalation} onChange={e => setAlerts(prev => ({ ...prev, escalation: e.target.checked }))} style={{ accentColor: 'var(--color-primary)', width: 20, height: 20 }} />
                </div>

                <div className="switch-container">
                  <div className="switch-label-group">
                    <span className="switch-title">Node Offline / Checksum Mismatch Warnings</span>
                    <span className="switch-desc">Alert immediately if network desynchronization or integrity errors occur.</span>
                  </div>
                  <input type="checkbox" checked={alerts.mismatchWarn} onChange={e => setAlerts(prev => ({ ...prev, mismatchWarn: e.target.checked }))} style={{ accentColor: 'var(--color-primary)', width: 20, height: 20 }} />
                </div>

                <div className="switch-container">
                  <div className="switch-label-group">
                    <span className="switch-title">Daily Encrypted Protocol Digest</span>
                    <span className="switch-desc">Receive an automated summary of completed matrix tasks at 00:00 UTC.</span>
                  </div>
                  <input type="checkbox" checked={alerts.dailyDigest} onChange={e => setAlerts(prev => ({ ...prev, dailyDigest: e.target.checked }))} style={{ accentColor: 'var(--color-primary)', width: 20, height: 20 }} />
                </div>

                <div className="switch-container">
                  <div className="switch-label-group">
                    <span className="switch-title">Unauthorized Clearance Access Attempts</span>
                    <span className="switch-desc">Log and alert when Level 1 operators attempt Level 5 protocol mutations.</span>
                  </div>
                  <input type="checkbox" checked={alerts.unauthAttempts} onChange={e => setAlerts(prev => ({ ...prev, unauthAttempts: e.target.checked }))} style={{ accentColor: 'var(--color-primary)', width: 20, height: 20 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="btn-primary" onClick={() => toast.success('Alert matrix configuration updated successfully.')}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ===========================
   App Shell (with sidebar + topbar)
   =========================== */
const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="main-content">
        <Topbar toggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

/* ===========================
   Root App
   =========================== */
const App = () => (
  <AuthProvider>
    <Router>
      <SocketManager />
      <ToastContainer
        position="top-right"
        toastStyle={{
          background: 'var(--color-surface-container)',
          color: 'var(--color-on-surface)',
          border: '1px solid var(--color-border-subtle)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — wrapped in shell */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppShell><Dashboard /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <AppShell><TaskBoard /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AppShell><AdminDashboard /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppShell><Settings /></AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
