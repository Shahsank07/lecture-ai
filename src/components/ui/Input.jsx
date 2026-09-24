import { forwardRef, useId } from 'react';
import './Input.css';

export const Input = forwardRef((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    rightAction,
    className = '',
    id: providedId,
    disabled = false,
    required = false,
    onChange,
    ...props
  },
  ref
) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="input-icon-wrapper">
        {leftIcon && <span className="input-icon" aria-hidden="true">{leftIcon}</span>}
        <input
          ref={ref}
          id={id}
          className={`input ${hasError ? 'input-error' : ''}`}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          aria-required={required}
          onChange={handleChange}
          {...props}
        />
        {rightIcon && <span className="input-icon input-icon-right" aria-hidden="true">{rightIcon}</span>}
        {rightAction && (
          <button
            type="button"
            className="input-action"
            onClick={rightAction.onClick}
            aria-label={rightAction['aria-label']}
            disabled={disabled}
          >
            {rightAction.icon}
          </button>
        )}
      </div>
      {hasError && (
        <p id={errorId} className="input-error-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !hasError && (
        <p id={helperId} className="input-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef((
  {
    label,
    error,
    helperText,
    className = '',
    id: providedId,
    disabled = false,
    required = false,
    rows = 4,
    ...props
  },
  ref
) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={`textarea ${hasError ? 'input-error' : ''}`}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        aria-required={required}
        rows={rows}
        {...props}
      />
      {hasError && (
        <p id={errorId} className="input-error-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !hasError && (
        <p id={helperId} className="input-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef((
  {
    label,
    error,
    helperText,
    options = [],
    placeholder,
    className = '',
    id: providedId,
    disabled = false,
    required = false,
    ...props
  },
  ref
) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`select ${hasError ? 'input-error' : ''}`}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled selected hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p id={errorId} className="input-error-text" role="alert">
          {error}
        </p>
      )}
      {helperText && !hasError && (
        <p id={helperId} className="input-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export const Label = ({ children, className = '', htmlFor, ...props }) => (
  <label className={`label ${className}`} htmlFor={htmlFor} {...props}>
    {children}
  </label>
);