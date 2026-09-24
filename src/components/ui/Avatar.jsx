import { forwardRef } from 'react';
import './Avatar.css';

export const Avatar = forwardRef((
  {
    src,
    alt = '',
    name,
    size = 'base',
    className = '',
    ...props
  },
  ref
) => {
  const classNames = [
    'avatar',
    size !== 'base' && `avatar-${size}`,
    className
  ].filter(Boolean).join(' ');

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const bgColors = [
    'var(--primary-100)',
    'var(--success-100)',
    'var(--warning-100)',
    'var(--error-100)',
    'var(--ai-100)',
  ];
  const textColors = [
    'var(--primary-700)',
    'var(--success-700)',
    'var(--warning-700)',
    'var(--error-700)',
    'var(--ai-700)',
  ];

  const colorIndex = name
    ? name.charCodeAt(0) % bgColors.length
    : 0;

  const style = {
    backgroundColor: bgColors[colorIndex],
    color: textColors[colorIndex],
  };

  return (
    <div
      ref={ref}
      className={classNames}
      style={style}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        initials
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export const AvatarGroup = ({ avatars = [], max = 5, size = 'base', className = '' }) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`avatar-group ${className}`} style={{ '--avatar-size': size }}>
      {visible.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          alt={avatar.name}
          style={{ zIndex: max - index }}
        />
      ))}
      {remaining > 0 && (
        <div
          className={`avatar avatar-${size} avatar-more`}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--bg-primary)',
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};