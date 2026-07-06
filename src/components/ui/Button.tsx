import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coh-gold/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded cursor-pointer active:scale-[0.98]";
  
  const variants = {
    primary: "bg-coh-gold text-coh-navy hover:bg-coh-gold/90 hover:shadow-md border border-transparent",
    secondary: "bg-coh-navy text-coh-cream hover:bg-coh-navy-light hover:shadow-md border border-transparent",
    outline: "border border-coh-gold/30 text-coh-navy hover:bg-coh-gold/10 hover:border-coh-gold/50",
    ghost: "text-coh-navy hover:bg-coh-navy/5",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:shadow-sm"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
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
