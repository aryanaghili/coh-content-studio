import os

# Create ui folder if it doesn't exist
os.makedirs("src/components/ui", exist_ok=True)

# 1. Button.tsx
button_content = """import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center gap-2 font-sans font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-md cursor-pointer active:scale-[0.98]";
  
  const variants = {
    primary: "bg-brand-gold text-text-inverse hover:bg-brand-gold-hover shadow-sm border border-transparent",
    secondary: "bg-surface-secondary text-text-primary hover:bg-border-standard border border-border-standard shadow-sm",
    outline: "border border-border-strong text-text-primary hover:bg-surface-inset",
    ghost: "text-text-secondary hover:bg-surface-inset hover:text-text-primary",
    danger: "bg-status-error text-text-inverse hover:brightness-110 shadow-sm border border-transparent"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-[15px]",
    icon: "h-10 w-10 p-0"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
"""

# 2. Card.tsx
card_content = """import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function Card({ 
  children, 
  padding = 'md', 
  interactive = false,
  className = '', 
  ...props 
}: CardProps) {
  
  const baseStyles = "bg-surface-primary rounded-lg border border-border-standard shadow-level-1 overflow-hidden";
  
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  const interactiveStyles = interactive 
    ? "cursor-pointer hover:shadow-level-2 hover:border-brand-gold transition-all duration-150 active:scale-[0.99]" 
    : "";

  return (
    <div 
      className={`${baseStyles} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`mb-4 pb-3 border-b border-border-standard ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={`font-sans text-[15px] leading-[22px] font-semibold text-text-primary ${className}`}>{children}</h3>;
}
"""

# 3. Badge.tsx
badge_content = """import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '', 
  ...props 
}: BadgeProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-sans font-semibold rounded-full uppercase tracking-wider";
  
  const variants = {
    default: "bg-surface-secondary text-text-primary",
    success: "bg-status-success/10 text-status-success",
    warning: "bg-status-warning/10 text-status-warning",
    error: "bg-status-error/10 text-status-error",
    info: "bg-status-info/10 text-status-info",
    outline: "border border-border-strong text-text-secondary"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] leading-tight",
    md: "px-2.5 py-1 text-[11px] leading-[16px]"
  };

  return (
    <span 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
"""

# 4. Input.tsx
input_content = """import React from 'react';

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
          <label className="font-sans font-semibold text-[13px] leading-[18px] text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-10 px-3 py-2 w-full bg-surface-inset border ${error ? 'border-status-error focus-visible:ring-status-error' : 'border-border-standard focus-visible:ring-focus-ring'} rounded-md font-sans text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all focus-visible:ring-2 focus-visible:border-transparent ${className}`}
          {...props}
        />
        {error && <p className="font-sans text-[13px] text-status-error mt-1">{error}</p>}
        {helperText && !error && <p className="font-sans text-[13px] text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
"""

# Write files
with open("src/components/ui/Button.tsx", "w") as f: f.write(button_content)
with open("src/components/ui/Card.tsx", "w") as f: f.write(card_content)
with open("src/components/ui/Badge.tsx", "w") as f: f.write(badge_content)
with open("src/components/ui/Input.tsx", "w") as f: f.write(input_content)

print("Generated basic UI components")
