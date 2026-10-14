import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="font-sans font-medium text-[12px] leading-[17px] text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-9 px-3 py-1.5 w-full bg-surface-inset border ${error ? 'border-status-error focus-visible:ring-status-error' : 'border-border-standard focus-visible:ring-focus-ring'} rounded-lg font-sans text-[13px] text-text-primary placeholder:text-text-muted outline-none transition-all focus-visible:ring-2 focus-visible:border-brand-gold ${className}`}
          {...props}
        />
        {error && <p className="font-sans text-[12px] text-status-error mt-0.5">{error}</p>}
        {helperText && !error && <p className="font-sans text-[12px] text-text-muted mt-0.5">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
