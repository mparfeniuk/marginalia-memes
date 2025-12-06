import React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  className,
  children,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medieval mb-1.5 text-medieval-parchment">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-2.5 py-1.5 text-sm bg-medieval-brown border-2 border-medieval-gold',
          'text-medieval-parchment font-medieval',
          'rounded focus:outline-none focus:ring-2 focus:ring-medieval-gold',
          'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

