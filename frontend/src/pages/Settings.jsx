import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Palette,
  LogOut,
  Check,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await api.updateProfile({ name, currency, theme });
      updateUser(res.user);
      setProfileSuccess('Profile preferences saved successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.updatePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Account & Settings</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your personal details, preferred currency, theme, and security
        </p>
      </div>

      {/* College Project Badge */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-muted)',
          borderColor: 'var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-red-light)',
              color: 'var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>SpendWise - College Project Architecture</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Demonstrating a complete MERN stack (MongoDB, Express, React, Node.js) with secure HTTP-only JWT cookies, bcrypt hashing, multi-tenant ownership protection, and responsive analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Profile & Currency Settings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <User size={18} color="var(--accent-red)" />
            <span>Profile & Currency</span>
          </h3>
        </div>

        {profileSuccess && (
          <div className="alert alert-success">
            <Check size={18} />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Email Address (Registered)</label>
            <input
              type="text"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7, backgroundColor: 'var(--bg-muted)' }}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                <option value="AUD">AUD (AU$) - Australian Dollar</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Appearance / Theme</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${theme === 'light' ? 'var(--accent-red)' : 'var(--border)'}`,
                  backgroundColor: theme === 'light' ? 'var(--accent-red-light)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  style={{ display: 'none' }}
                />
                Light Mode
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${theme === 'dark' ? 'var(--accent-red)' : 'var(--border)'}`,
                  backgroundColor: theme === 'dark' ? 'var(--accent-red-light)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  style={{ display: 'none' }}
                />
                Dark Mode
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Shield size={18} color="var(--accent-red)" />
            <span>Security & Password</span>
          </h3>
        </div>

        {passwordSuccess && (
          <div className="alert alert-success">
            <Check size={18} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">New Password (min 6 characters)</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-secondary" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Sign Out Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>Sign Out</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Clear current session cookie and securely log out of SpendWise.
            </p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
