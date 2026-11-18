import React from 'react';

export default function StatCard({ title, amount, subtext, icon: Icon, colorVariant = 'red', isFormatted = false }) {
  return (
    <div className="card stat-card">
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className={`stat-icon-wrapper ${colorVariant}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className={`stat-value ${colorVariant}`}>
        {amount}
      </div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
}
