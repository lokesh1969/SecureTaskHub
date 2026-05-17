import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Access granted. Welcome back, Commander.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Brand Panel */}
      <div className="auth-brand">
        <div className="auth-brand-bg" />
        <div className="auth-brand-content">
          <h1>SECURETASKHUB</h1>
          <p className="tagline">The Protocol for Precision.</p>
          <div className="auth-brand-chips">
            <div className="auth-chip" style={{ color: 'var(--color-primary)' }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: 'var(--color-security-safe)',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #25C2A0',
                }}
                className="dot-pulse"
              />
              Sys_Online
            </div>
            <div className="auth-chip" style={{ color: 'var(--color-on-surface-variant)' }}>
              Node 04
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-heading">
            <h2>Authenticate</h2>
            <p>Enter credentials to access the encrypted node.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-form-field">
              <label className="form-label" htmlFor="email">Operator ID</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="operator@securenode.local"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-form-field">
              <div className="auth-form-field-row">
                <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Access Key</label>
                <span style={{ fontSize: 11, color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Reset Key
                </span>
              </div>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ marginTop: 6 }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', marginTop: 8 }}>
              {loading
                ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>sync</span> Validating Key</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_open</span> Authenticate</>
              }
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
            New operator?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
