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
  primary: 'app-button-primary',
  secondary: 'app-button-secondary',
  ghost: 'app-button-ghost',
  danger: 'app-button-danger',
  success: 'app-button-success',
};

const sizes: Record<AppButtonSize, string> = {
  compact: 'min-h-10 px-3 text-xs rounded-xl',
  standard: 'min-h-12 px-3.5 text-[13px] rounded-xl',
  large: 'min-h-12 px-4 text-sm rounded-xl',
  icon: 'h-12 w-12 shrink-0 p-0 rounded-xl',
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
      className={`app-button inline-flex items-center justify-center gap-2 font-extrabold cursor-pointer ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
