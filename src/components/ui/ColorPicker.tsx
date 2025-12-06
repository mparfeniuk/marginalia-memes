'use client'

import React, { useState } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  label?: string
  color: string
  onChange: (color: string) => void
  className?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  color,
  onChange,
  className,
}) => {
  const [showPicker, setShowPicker] = useState(false)

  const handleChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex)
  }

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-xs font-medieval mb-1.5 text-medieval-parchment">
          {label}
        </label>
      )}
      <div
        className="w-full h-8 border-2 border-medieval-gold rounded cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />
      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute z-20 mt-2">
            <SketchPicker color={color} onChange={handleChange} />
          </div>
        </>
      )}
    </div>
  )
}

