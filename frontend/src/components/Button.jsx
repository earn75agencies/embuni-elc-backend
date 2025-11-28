/**
 * Modern Button Component
 * Accessible, customizable button with loading states
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-neutral-200 text-charcoal hover:bg-neutral-300 focus:ring-neutral-400',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2 
          className={clsx(
            'animate-spin',
            iconPosition === 'left' ? 'mr-2' : 'ml-2',
            children && (iconPosition === 'left' ? 'mr-2' : 'ml-2')
          )}
          size={iconSizes[size]}
        />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="mr-2" size={iconSizes[size]} />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="ml-2" size={iconSizes[size]} />
      )}
    </button>
  );
};

export default Button;

