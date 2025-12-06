import React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Slider: React.FC<SliderProps> = ({
  label,
  className,
  value,
  min = 0,
  max = 100,
  ...props
}) => {
  const percentage = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medieval mb-2 text-medieval-parchment">
          {label}
        </label>
      )}
      <div className="relative h-6 flex items-center">
        {/* Custom track background */}
        <div className="absolute left-0 right-0 h-2 rounded-lg bg-medieval-dark pointer-events-none top-1/2 -translate-y-1/2" />
        {/* Filled portion */}
        <div
          className="absolute left-0 h-2 rounded-l-lg bg-medieval-gold pointer-events-none top-1/2 -translate-y-1/2"
          style={{ width: `${percentage}%`, transition: 'none' }}
        />
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          className={cn(
            'w-full appearance-none cursor-pointer relative z-10 bg-transparent',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-medieval-gold [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-medieval-dark [&::-webkit-slider-thumb]:shadow-md',
            '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-medieval-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-medieval-dark [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md',
            '[&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg',
            '[&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-lg',
            className
          )}
          style={{
            height: '24px', // h-6 = 24px
            marginTop: '0',
            marginBottom: '0',
          }}
          {...props}
        />
      </div>
    </div>
  )
}
