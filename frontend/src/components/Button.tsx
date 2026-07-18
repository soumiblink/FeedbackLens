import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'base',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-500 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500',
    outline: 'bg-transparent border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-9',
    base: 'px-4 py-2.5 h-[42px]',
    lg: 'px-6 py-3 text-lg h-12'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
