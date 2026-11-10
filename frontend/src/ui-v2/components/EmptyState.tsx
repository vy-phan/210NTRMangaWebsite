import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

// Trạng thái rỗng = lời mời làm việc tiếp theo, có nút đi tới
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, actionTo, onAction }) => (
  <div className="py-16 flex flex-col items-center gap-4 text-center">
    {icon && (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)' }}>
        {icon}
      </div>
    )}
    <div className="space-y-1">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-xs mx-auto">{description}</p>}
    </div>
    {actionLabel && (actionTo ? (
      <Link to={actionTo} className="btn-primary">{actionLabel}</Link>
    ) : (
      <button onClick={onAction} className="btn-primary">{actionLabel}</button>
    ))}
  </div>
);

export default EmptyState;
