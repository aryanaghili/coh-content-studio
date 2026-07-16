import React from 'react';

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
  
  const baseStyles = "bg-white rounded border border-coh-gold/20 shadow-sm";
  
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  const interactiveStyles = interactive 
    ? "cursor-pointer hover:shadow-md hover:border-coh-gold/40 transition-all active:scale-[0.99]" 
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
  return <div className={`mb-4 pb-3 border-b border-coh-gold/10 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={`font-serif text-xl font-bold text-white ${className}`}>{children}</h3>;
}
