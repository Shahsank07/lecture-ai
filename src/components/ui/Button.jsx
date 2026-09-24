import { forwardRef } from 'react';
import './Button.css';

export const Button = forwardRef((
  {
    children,
    variant = 'primary',
    size = 'base',
    fullWidth = false,
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className = '',
    type = 'button',
    onClick,
    ...props
  },
  ref
) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    size !== 'base' && `btn-${size}`,
    fullWidth && 'btn-full',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        <>
          {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
          <span className="btn-text">{children}</span>
          {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export const IconButton = forwardRef((
  {
    children,
    variant = 'ghost',
    size = 'base',
    disabled = false,
    loading = false,
    className = '',
    'aria-label': ariaLabel,
    onClick,
    ...props
  },
  ref
) => {
  const classNames = [
    'btn',
    'btn-icon',
    `btn-${variant}`,
    size !== 'base' && `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  if (!ariaLabel) {
    console.warn('IconButton requires an aria-label for accessibility');
  }

  return (
    <button
      ref={ref}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : children}
    </button>
  );
});

IconButton.displayName = 'IconButton';