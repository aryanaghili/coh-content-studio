import os

textarea_content = """import React from 'react';

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
"""

select_content = """import React from 'react';

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
          <label className="font-sans font-semibold text-[13px] leading-[18px] text-text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`h-10 px-3 py-2 w-full bg-surface-inset border ${error ? 'border-status-error focus-visible:ring-status-error' : 'border-border-standard focus-visible:ring-focus-ring'} rounded-md font-sans text-[14px] text-text-primary outline-none transition-all focus-visible:ring-2 focus-visible:border-transparent appearance-none ${className}`}
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238A94A3%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="font-sans text-[13px] text-status-error mt-1">{error}</p>}
        {helperText && !error && <p className="font-sans text-[13px] text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
"""

with open("src/components/ui/Textarea.tsx", "w") as f: f.write(textarea_content)
with open("src/components/ui/Select.tsx", "w") as f: f.write(select_content)

print("Generated Textarea and Select components")
