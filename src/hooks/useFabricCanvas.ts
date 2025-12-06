'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, IText, Image as FabricImage } from 'fabric'

const getCanvasDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 800, height: 600 }
  }
  
  const maxWidth = Math.min(800, window.innerWidth - 64)
  const aspectRatio = 4 / 3
  return {
    width: maxWidth,
    height: maxWidth / aspectRatio,
  }
}

export function useFabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [selectedObject, setSelectedObject] = useState<any | null>(null)

  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    const { width, height } = getCanvasDimensions()
    const fabricCanvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
    })

    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    fabricCanvas.on('object:modified', () => {
      fabricCanvas.renderAll()
    })

    fabricCanvasRef.current = fabricCanvas
    setCanvas(fabricCanvas)

    // Handle window resize
    const handleResize = () => {
      const { width, height } = getCanvasDimensions()
      fabricCanvas.setDimensions({ width, height })
      fabricCanvas.renderAll()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      fabricCanvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [])

  const loadImageToCanvas = useCallback((imageUrl: string) => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) {
      console.error('Canvas not ready')
      return
    }

    console.log('=== Loading image ===', imageUrl)

    // Clear all objects first
    fabricCanvas.clear()
    fabricCanvas.backgroundColor = '#ffffff'

    // Create HTML Image element
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      console.log('Image loaded successfully:', img.width, 'x', img.height)
      
      const canvasWidth = fabricCanvas.width || 800
      const canvasHeight = fabricCanvas.height || 600
      
      // Calculate scale to fit canvas
      const scaleX = canvasWidth / img.width
      const scaleY = canvasHeight / img.height
      const scale = Math.min(scaleX, scaleY)
      
      // Create fabric image
      const fabricImg = new FabricImage(img, {
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - img.width * scale) / 2,
        top: (canvasHeight - img.height * scale) / 2,
        selectable: false,
        evented: false,
      })
      
      // Add to canvas
      fabricCanvas.add(fabricImg)
      fabricCanvas.sendObjectToBack(fabricImg)
      fabricCanvas.renderAll()
      
      console.log('Image added to canvas, rendering...')
    }
    
    img.onerror = (error) => {
      console.error('ERROR loading image:', error)
      console.error('Image URL:', imageUrl)
    }
    
    img.src = imageUrl
  }, [])

  const addText = useCallback((text: string, options?: Partial<any>) => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    const canvasWidth = fabricCanvas.width || 800
    const canvasHeight = fabricCanvas.height || 600

    const textObject = new IText(text, {
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'MedievalSharp',
      fontSize: 40,
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 2,
      textAlign: 'center',
      editable: true,
      ...options,
    })

    fabricCanvas.add(textObject)
    fabricCanvas.setActiveObject(textObject)
    fabricCanvas.renderAll()
    setSelectedObject(textObject)
    
    // Enter editing mode immediately
    textObject.enterEditing()
    textObject.selectAll()
  }, [])

  const deleteSelected = useCallback(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas || !selectedObject) return

    fabricCanvas.remove(selectedObject)
    fabricCanvas.renderAll()
    setSelectedObject(null)
  }, [selectedObject])

  const exportCanvas = useCallback((format: 'png' | 'jpeg' = 'png'): string => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return ''
    return fabricCanvas.toDataURL({ format, quality: 1, multiplier: 1 })
  }, [])

  return {
    canvasRef,
    canvas,
    selectedObject,
    loadImageToCanvas,
    addText,
    deleteSelected,
    exportCanvas,
  }
}
