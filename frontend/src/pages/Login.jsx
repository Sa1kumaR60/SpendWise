import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('demo@spendwise.edu');
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="brand-icon">
              <Wallet size={20} />
            </div>
            <div className="brand-text">
              Spend<span>Wise</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Enter your credentials to access your personal finances
          </p>
        </div>

        {/* Demo Account Callout */}
        <div className="demo-box">
          <div className="demo-title">
            <Sparkles size={16} color="var(--accent-red)" />
            <span>College Presentation Demo Account</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            For grading or demonstration, use the pre-loaded student budget account:
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleFillDemo}
            style={{ width: '100%', borderColor: 'var(--accent-red-border)', color: 'var(--accent-red)' }}
          >
            Auto-fill Demo Credentials
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              required
              placeholder="e.g. demo@spendwise.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
