import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon,
  className = '',
  id,
  ...props 
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-xs uppercase tracking-wider text-amber-500 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`
            w-full bg-stone-900/50 border border-stone-700 text-stone-200 
            px-4 py-3 rounded-sm focus:outline-none focus:border-amber-700 
            transition-colors duration-300 placeholder:text-stone-600
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};
