import React from 'react';

export default function ProgressBar({ percentage, status = 'normal' }) {
  const cappedWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="progress-container">
      <div
        className={`progress-bar ${status}`}
        style={{ width: `${cappedWidth}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
}
