import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axios';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      toast.success('Access provisioned. You may now authenticate.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Provisioning failed.');
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
          <div style={{ marginTop: 40 }}>
            <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.7, maxWidth: 380 }}>
              A secure task management platform built for professional teams requiring precision, RBAC, and real-time visibility.
            </p>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Role-Based Access Control', 'Real-Time Notifications', 'End-to-End Security Hardening'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-primary)' }}>check_circle</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-heading">
            <h2>Request Access</h2>
            <p>Provision a new operator identity on the network.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-form-field">
              <label className="form-label" htmlFor="email">Operator ID (Email)</label>
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
              <label className="form-label" htmlFor="password">Access Key (Password)</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', marginTop: 8 }}>
              {loading
                ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>sync</span> Provisioning</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span> Create Identity</>
              }
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
            Already provisioned?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Authenticate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
