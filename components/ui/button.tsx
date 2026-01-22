import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "transition-all duration-300 uppercase tracking-widest font-medium rounded-sm flex items-center justify-center";
  
  const variants = {
    primary: "bg-amber-700 hover:bg-amber-800 text-amber-50 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "border border-amber-700 text-amber-50 hover:bg-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-amber-200 hover:text-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
