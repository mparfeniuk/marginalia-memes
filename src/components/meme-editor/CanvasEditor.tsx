'use client'

import React, { useRef, useEffect } from 'react'
import { PremadeImage } from '@/types/meme'

interface CanvasEditorProps {
  selectedImage?: PremadeImage | null
  canvasRef: React.RefObject<HTMLCanvasElement>
  loadImage: (imageUrl: string) => void
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: () => void
  handleTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void
  handleTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void
  handleTouchEnd?: (e: React.TouchEvent<HTMLCanvasElement>) => void
  isCanvasReady?: boolean
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  selectedImage,
  canvasRef,
  loadImage,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove: handleTouchMoveProp,
  handleTouchEnd,
  isCanvasReady = false,
}) => {
  const loadedImageRef = useRef<string | null>(null)

  // Load selected image when it changes
  useEffect(() => {
    if (!selectedImage) return
    
    if (selectedImage.path !== loadedImageRef.current) {
      loadedImageRef.current = selectedImage.path
      loadImage(selectedImage.path)
    }
  }, [selectedImage, loadImage])

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

  return (
    <div className="flex flex-col h-full min-h-[300px] relative">
      <div
        className="flex-1 sm:border-2 sm:border-dashed border-medieval-gold rounded-lg p-0 sm:p-4 bg-medieval-dark/50 transition-all hover:border-medieval-rust flex items-center justify-center overflow-auto min-h-[250px]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div 
          className="w-full flex items-center justify-center relative min-h-[200px] py-4 transition-all duration-500 ease-in-out"
          style={{ transition: 'height 0.5s ease-in-out, width 0.5s ease-in-out' }}
        >
          {/* Loader - завжди рендериться, але контролюється через CSS */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-medieval-dark/70 backdrop-blur-sm z-10 transition-all duration-500 ease-in-out"
            style={{
              opacity: isCanvasReady ? 0 : 1,
              pointerEvents: isCanvasReady ? 'none' : 'auto',
              visibility: isCanvasReady ? 'hidden' : 'visible',
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-medieval-dark rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-medieval-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-medieval-parchment text-sm font-medieval animate-pulse">Завантаження зображення...</p>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className={`sm:border-2 border-medieval-gold sm:rounded-lg bg-white shadow-lg cursor-move transition-opacity duration-300 ease-in-out w-full sm:w-auto ${
              isCanvasReady ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              maxWidth: '100%', 
              objectFit: 'contain', 
              transition: 'opacity 0.3s ease-in-out'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMoveProp}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      </div>
    </div>
  )
}
