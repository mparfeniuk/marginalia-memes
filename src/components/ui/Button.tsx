import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'font-medieval font-bold transition-all duration-200 border-2'
  
  const variantStyles = {
    primary: 'bg-medieval-gold text-medieval-dark border-medieval-gold hover:bg-medieval-rust hover:border-medieval-rust hover:text-white',
    secondary: 'bg-transparent text-medieval-gold border-medieval-gold hover:bg-medieval-gold hover:text-medieval-dark',
    danger: 'bg-medieval-burgundy text-white border-medieval-burgundy hover:bg-red-800',
  }

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}




