import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="font-sans font-semibold text-[13px] leading-[18px] text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`min-h-[100px] px-3 py-2 w-full bg-surface-inset border ${error ? 'border-status-error focus-visible:ring-status-error' : 'border-border-standard focus-visible:ring-focus-ring'} rounded-md font-sans text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all focus-visible:ring-2 focus-visible:border-transparent resize-y ${className}`}
          {...props}
        />
        {error && <p className="font-sans text-[13px] text-status-error mt-1">{error}</p>}
        {helperText && !error && <p className="font-sans text-[13px] text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
