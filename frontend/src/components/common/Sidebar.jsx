import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/budgets', label: 'Budgets', icon: PiggyBank },
    { to: '/categories', label: 'Categories', icon: Tags },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <Wallet size={20} />
          </div>
          <div className="brand-text">
            Spend<span>Wise</span>
          </div>
          {isOpen && (
            <button
              className="btn-icon"
              style={{ marginLeft: 'auto' }}
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name" title={user?.name}>{user?.name || 'User'}</span>
              <span className="user-email" title={user?.email}>{user?.email || ''}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-icon"
            title="Log Out"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
