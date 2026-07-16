import React from 'react';

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
