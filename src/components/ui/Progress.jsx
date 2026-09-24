export function Progress({ value, max = 100, size = 'base', className = '', ...props }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'progress-sm',
    base: 'progress-base',
    lg: 'progress-lg',
  };

  return (
    <div className={`progress ${sizeClasses[size]} ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} {...props}>
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
    </div>
  );
}