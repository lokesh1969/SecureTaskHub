import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleInitials = (email: string) => email.slice(0, 2).toUpperCase();

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load operator roster');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Clearance level updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update clearance');
    }
  };

  const handleRevokeAccess = (userId: string, email: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.info(`Operator access revoked for ${email} (simulated).`);
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="section-heading" style={{ marginBottom: 32 }}>
        <h2>Access Control Roster</h2>
        <p>Manage operator clearance levels and system access across all nodes.</p>
      </div>

      {/* Filter Input */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Filter operators by ID or clearance level..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <div style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border-subtle)', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>
                <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} />
              </th>
              <th>Operator</th>
              <th>Clearance Level</th>
              <th>Status</th>
              <th>Provisioned</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
                  No operators match the specified query criteria.
                </td>
              </tr>
            )}
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td><input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32,
                      background: 'var(--color-surface-variant)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'var(--color-on-surface)',
                    }}>
                      {roleInitials(user.email)}
                    </div>
                    <span>{user.email}</span>
                  </div>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-on-surface)',
                      fontFamily: 'inherit',
                      fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '6px 10px',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="USER">Level 1 (Viewer)</option>
                    <option value="MANAGER">Level 3 (Editor)</option>
                    <option value="ADMIN">Level 5 (Admin)</option>
                  </select>
                </td>
                <td>
                  <span className="badge badge-secure">
                    <div style={{ width: 6, height: 6, background: 'var(--color-primary)', borderRadius: '50%' }} />
                    Active
                  </span>
                </td>
                <td style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
                  {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn-ghost"
                    title="Revoke access"
                    style={{ padding: '6px' }}
                    onClick={() => handleRevokeAccess(user.id, user.email)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>block</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
