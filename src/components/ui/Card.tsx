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

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`px-5 py-4 bg-surface-inset border-t border-border-standard ${className}`}>{children}</div>;
}
