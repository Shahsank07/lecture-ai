import './Skeleton.css';

export const Skeleton = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
  ...props
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height, ...props.style }}
      {...props}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="skeleton-group">{skeletons}</div>;
};

export const SkeletonCard = ({ className = '', lines = 3, ...props }) => (
  <div className={`skeleton-card ${className}`} {...props}>
    <div className="skeleton skeleton-title" style={{ marginBottom: 16 }} />
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className="skeleton skeleton-text" style={{ marginBottom: 12 }} />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'base', className = '', ...props }) => {
  const sizeMap = { sm: 32, base: 40, lg: 56, xl: 80 };
  const dimension = sizeMap[size];
  return (
    <div
      className={`skeleton skeleton-avatar ${className}`}
      style={{ width: dimension, height: dimension, ...props.style }}
      {...props}
    />
  );
};

export const SkeletonButton = ({ className = '', ...props }) => (
  <div
    className={`skeleton skeleton-button ${className}`}
    style={{ height: 40, width: 120, ...props.style }}
    {...props}
  />
);

export const SkeletonList = ({ items = 5, className = '', ...props }) => (
  <div className={`skeleton-list ${className}`} {...props}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="skeleton-list-item">
        <SkeletonAvatar size="sm" />
        <div className="skeleton-list-content">
          <Skeleton variant="title" style={{ width: '40%', marginBottom: 8 }} />
          <Skeleton variant="text" style={{ width: '60%' }} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className = '', ...props }) => (
  <div className={`skeleton-table ${className}`} {...props}>
    <div className="skeleton-table-header">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={i} variant="text" style={{ width: '100%' }} />
      ))}
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="skeleton-table-row">
        {Array.from({ length: cols }, (_, j) => (
          <Skeleton key={j} variant="text" style={{ width: '100%' }} />
        ))}
      </div>
    ))}
  </div>
);