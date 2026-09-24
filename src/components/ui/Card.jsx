import { forwardRef } from 'react';
import './Card.css';

export const Card = forwardRef((
  {
    children,
    className = '',
    elevated = false,
    interactive = false,
    padded = true,
    onClick,
    ...props
  },
  ref
) => {
  const classNames = [
    'card',
    elevated && 'card-elevated',
    interactive && 'card-interactive',
    padded && 'card-padded',
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      ref={ref}
      className={classNames}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`card-header ${className}`} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`card-body ${className}`} {...props}>
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`card-footer ${className}`} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';