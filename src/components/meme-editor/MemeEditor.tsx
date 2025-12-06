'use client'

import React, { useRef, useEffect } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { TextControls } from '@/components/text-controls/TextControls'
import { Button } from '@/components/ui/Button'
import { downloadImage } from '@/lib/utils'
import { PremadeImage } from '@/types/meme'

interface MemeEditorProps {
  selectedImage?: PremadeImage | null
}

export const MemeEditor: React.FC<MemeEditorProps> = ({ selectedImage }) => {
  const {
    canvasRef,
    selectedText,
    loadImage,
    addText,
    updateText,
    deleteText,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    exportCanvas,
  } = useCanvas()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadedImageRef = useRef<string | null>(null)

  // Load selected image when it changes
  useEffect(() => {
    if (!selectedImage) return
    
    if (selectedImage.path !== loadedImageRef.current) {
      loadedImageRef.current = selectedImage.path
      loadImage(selectedImage.path)
    }
  }, [selectedImage, loadImage])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      loadedImageRef.current = imageUrl
      loadImage(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      loadedImageRef.current = imageUrl
      loadImage(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleExport = () => {
    const dataUrl = exportCanvas('png')
    if (dataUrl) {
      downloadImage(dataUrl, 'marginalia-meme.png')
    }
  }

  const handleAddText = () => {
    addText('Your text here')
  }

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-medieval-gold rounded-lg p-4 md:p-8 bg-medieval-dark/50 transition-all hover:border-medieval-rust"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-full flex justify-center overflow-x-auto">
            <canvas
              ref={canvasRef}
              className="border-2 border-medieval-gold rounded-lg bg-white max-w-full shadow-lg cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          <p className="text-medieval-parchment text-sm text-center">
            Click text to select • Drag to move • Double-click to edit
          </p>
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <Button 
              onClick={handleAddText}
              className="flex-1 sm:flex-none"
            >
              + Add Text
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="secondary" 
              onClick={handleExport}
              className="flex-1 sm:flex-none"
            >
              Download Meme
            </Button>
          </div>
        </div>
      </div>

      <TextControls
        selectedText={selectedText}
        onUpdateText={updateText}
        onDeleteText={deleteText}
      />
    </div>
  )
}
