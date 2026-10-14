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
  
  const baseStyles = "inline-flex items-center justify-center gap-2 font-sans font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-lg cursor-pointer active:scale-[0.99]";
  
  const variants = {
    primary: "bg-brand-gold text-text-inverse hover:bg-brand-gold-hover shadow-xs border border-transparent",
    secondary: "bg-surface-secondary text-text-primary hover:bg-surface-inset border border-border-standard shadow-2xs",
    outline: "bg-surface-primary border border-border-strong text-text-primary hover:bg-surface-inset hover:border-brand-gold/60",
    ghost: "text-text-secondary hover:bg-surface-inset hover:text-text-primary",
    danger: "bg-status-error text-white hover:brightness-110 shadow-xs border border-transparent"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-[13px]",
    lg: "h-11 px-5 text-[14px]",
    icon: "h-9 w-9 p-0"
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
