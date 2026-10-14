import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="font-sans font-medium text-[12px] leading-[17px] text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`h-9 px-3 py-1.5 w-full bg-surface-inset border ${error ? 'border-status-error focus-visible:ring-status-error' : 'border-border-standard focus-visible:ring-focus-ring'} rounded-lg font-sans text-[13px] text-text-primary outline-none transition-all focus-visible:ring-2 focus-visible:border-brand-gold appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="font-sans text-[12px] text-status-error mt-0.5">{error}</p>}
        {helperText && !error && <p className="font-sans text-[12px] text-text-muted mt-0.5">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
