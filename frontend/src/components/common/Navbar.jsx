import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ title, onToggleSidebar, month, onMonthChange }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {onMonthChange && (
          <div className="filter-group" style={{ margin: 0 }}>
            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="month"
              className="form-input"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              aria-label="Select month"
            />
          </div>
        )}
      </div>
    </header>
  );
}
