'use client'

import React, { useEffect, useState } from 'react'
import Select, { StylesConfig } from 'react-select'
import { Slider } from '@/components/ui/Slider'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { Button } from '@/components/ui/Button'

interface TextObject {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fill: string
  stroke: string
  strokeWidth: number
}

interface TextControlsProps {
  selectedText: TextObject | null
  onUpdateText: (id: string, updates: Partial<TextObject>) => void
  onDeleteText: (id: string) => void
}

interface FontOption {
  value: string
  label: string
}

// Flat font options list
const fontOptions: FontOption[] = [
  { value: 'Bangers', label: 'Bangers' },
  { value: 'UnifrakturMaguntia', label: 'UnifrakturMaguntia' },
  { value: 'Press Start 2P', label: 'Press Start 2P' },
  { value: 'Comic Neue', label: 'Comic Neue' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'PT Sans', label: 'PT Sans' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Open Sans', label: 'Open Sans' },
]

// Custom styles for react-select to match medieval theme
const customStyles: StylesConfig<FontOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#1a0f0a',
    borderColor: state.isFocused ? '#D4AF37' : '#8B4513',
    borderWidth: '2px',
    borderRadius: '0.375rem',
    minHeight: '36px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(212, 175, 55, 0.3)' : 'none',
    '&:hover': {
      borderColor: '#D4AF37'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#F5E6D3',
    fontSize: '0.875rem',
  }),
  input: (base) => ({
    ...base,
    color: '#F5E6D3',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1a0f0a',
    border: '2px solid #8B4513',
    borderRadius: '0.375rem',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#8B4513' 
      : state.isFocused 
        ? '#2d1810' 
        : 'transparent',
    color: state.isSelected ? '#F5E6D3' : '#F5E6D3',
    fontSize: '0.875rem',
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: state.data.value,
    '&:active': {
      backgroundColor: '#8B4513'
    }
  }),
  placeholder: (base) => ({
    ...base,
    color: '#a08060',
    fontSize: '0.875rem',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#D4AF37',
    padding: '4px',
    '&:hover': {
      color: '#D4AF37'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
}

export const TextControls: React.FC<TextControlsProps> = ({
  selectedText,
  onUpdateText,
  onDeleteText,
}) => {
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (selectedText) {
      setEditText(selectedText.text)
    }
  }, [selectedText])

  // Find current font option
  const getCurrentFontOption = (): FontOption | null => {
    if (!selectedText) return null
    const found = fontOptions.find(opt => opt.value === selectedText.fontFamily)
    if (found) return found
    // If not found, return a default option with current value
    return { value: selectedText.fontFamily, label: selectedText.fontFamily }
  }

  if (!selectedText) {
    return (
      <div className="bg-medieval-brown border-medieval border-2 rounded-lg p-3">
        <h2 className="text-lg font-decorative text-medieval-gold mb-2">
          Text Style
        </h2>
        <p className="text-medieval-parchment text-xs italic">
          Click &quot;Add Text&quot; to create text, then click on it to select
        </p>
      </div>
    )
  }

  const handleTextChange = (newText: string) => {
    setEditText(newText)
    onUpdateText(selectedText.id, { text: newText })
  }

  const handleFontChange = (option: FontOption | null) => {
    if (option) {
      onUpdateText(selectedText.id, { fontFamily: option.value })
    }
  }

  return (
    <div className="bg-medieval-brown border-medieval border-2 rounded-lg p-3 space-y-3">
      <h2 className="text-lg font-decorative text-medieval-gold">
        Text Style
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medieval mb-1.5 text-medieval-parchment">
            Text Content
          </label>
          <textarea
            value={editText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-medieval-dark border-2 border-medieval-gold rounded text-sm text-medieval-parchment font-medieval focus:outline-none focus:ring-2 focus:ring-medieval-gold resize-y min-h-[60px]"
            placeholder='Enter your text'
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-medieval mb-1.5 text-medieval-parchment">
              Font
            </label>
            <Select<FontOption, false>
              value={getCurrentFontOption()}
              onChange={handleFontChange}
              options={fontOptions}
              styles={customStyles}
              isSearchable={true}
              placeholder="Select font..."
              classNamePrefix="font-select"
            />
          </div>

          <Slider
            label={`Size: ${selectedText.fontSize}px`}
            min={12}
            max={120}
            value={selectedText.fontSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value)
              onUpdateText(selectedText.id, {
                fontSize: newSize,
              })
            }}
            onInput={(e) => {
              const newSize = parseInt((e.target as HTMLInputElement).value)
              onUpdateText(selectedText.id, {
                fontSize: newSize,
              })
            }}
          />

          <ColorPicker
            label="Text Color"
            color={selectedText.fill}
            onChange={(color) =>
              onUpdateText(selectedText.id, { fill: color })
            }
          />

          <ColorPicker
            label="Stroke Color"
            color={selectedText.stroke}
            onChange={(color) =>
              onUpdateText(selectedText.id, { stroke: color })
            }
          />

          <Slider
            label={`Stroke: ${selectedText.strokeWidth}px`}
            min={0}
            max={6}
            value={selectedText.strokeWidth}
            onChange={(e) => {
              const newWidth = parseInt(e.target.value)
              onUpdateText(selectedText.id, {
                strokeWidth: newWidth,
              })
            }}
            onInput={(e) => {
              const newWidth = parseInt((e.target as HTMLInputElement).value)
              onUpdateText(selectedText.id, {
                strokeWidth: newWidth,
              })
            }}
          />

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeleteText(selectedText.id)}
            className="w-full"
          >
            Delete Text
          </Button>
        </div>
      </div>
    </div>
  )
}
