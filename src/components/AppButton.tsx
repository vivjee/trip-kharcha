'use client';

import React from 'react';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type AppButtonSize = 'compact' | 'standard' | 'large' | 'icon';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
}

const variants: Record<AppButtonVariant, string> = {
  primary: 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-2xs',
  ghost: 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200',
  danger: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  success: 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

const sizes: Record<AppButtonSize, string> = {
  compact: 'min-h-10 px-3 text-xs rounded-xl',
  standard: 'min-h-11 px-3.5 text-[13px] rounded-xl',
  large: 'min-h-12 px-4 text-sm rounded-xl',
  icon: 'h-11 w-11 shrink-0 p-0 rounded-xl',
};

export default function AppButton({
  variant = 'secondary',
  size = 'standard',
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 border font-extrabold transition-colors active:translate-y-px cursor-pointer disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
