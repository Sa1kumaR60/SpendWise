import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'You currently have no records to display. Get started by creating your first entry.',
  actionText,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
}
