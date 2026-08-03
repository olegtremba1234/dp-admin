import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  primary: 'bg-brand-emerald-600 text-white hover:bg-brand-emerald-700',
  secondary: 'bg-navy-800 text-white hover:bg-navy-900',
  outline: 'border border-navy-200 text-navy-700 bg-white hover:bg-navy-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-navy-600 hover:bg-navy-50',
};

const sizes: Record<string, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
