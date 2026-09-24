import { forwardRef } from 'react';
import './Badge.css';

export const Badge = forwardRef((
  {
    children,
    variant = 'neutral',
    size = 'base',
    dot = false,
    className = '',
    ...props
  },
  ref
) => {
  const classNames = [
    'badge',
    `badge-${variant}`,
    size !== 'base' && `badge-${size}`,
    dot && 'badge-has-dot',
    className
  ].filter(Boolean).join(' ');

  return (
    <span ref={ref} className={classNames} {...props}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export const StatusBadge = ({ status, ...props }) => {
  const variantMap = {
    recording: 'error',
    paused: 'warning',
    completed: 'success',
    live: 'primary',
    ai: 'ai',
    idle: 'neutral',
  };
  return <Badge variant={variantMap[status] || 'neutral'} {...props} />;
};