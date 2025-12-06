import { useState, useCallback } from 'react'
import { Canvas, IText } from 'fabric'
import { DEFAULT_TEXT_STYLE, MEDIEVAL_FONTS, MedievalFont } from '@/lib/fabric'

export interface TextEditorState {
  fontFamily: MedievalFont
  fontSize: number
  fill: string
  stroke: string
  strokeWidth: number
}

const defaultState: TextEditorState = {
  fontFamily: 'Bangers',
  fontSize: DEFAULT_TEXT_STYLE.fontSize,
  fill: DEFAULT_TEXT_STYLE.fill,
  stroke: DEFAULT_TEXT_STYLE.stroke,
  strokeWidth: DEFAULT_TEXT_STYLE.strokeWidth,
}

export function useMemeEditor(canvas: Canvas | null) {
  const [textState, setTextState] = useState<TextEditorState>(defaultState)

  const updateSelectedText = useCallback(
    (updates: Partial<TextEditorState>) => {
      if (!canvas) return

      const activeObject = canvas.getActiveObject() as IText
      if (!activeObject || activeObject.type !== 'i-text') return

      const newState = { ...textState, ...updates }
      setTextState(newState)

      activeObject.set({
        fontFamily: newState.fontFamily,
        fontSize: newState.fontSize,
        fill: newState.fill,
        stroke: newState.stroke,
        strokeWidth: newState.strokeWidth,
      })

      canvas.renderAll()
    },
    [canvas, textState]
  )

  const syncWithSelectedObject = useCallback(() => {
    if (!canvas) return

      const activeObject = canvas.getActiveObject() as IText
    if (activeObject && activeObject.type === 'i-text') {
      setTextState({
        fontFamily: (activeObject.fontFamily || 'Bangers') as MedievalFont,
        fontSize: activeObject.fontSize || DEFAULT_TEXT_STYLE.fontSize,
        fill: (activeObject.fill as string) || DEFAULT_TEXT_STYLE.fill,
        stroke: (activeObject.stroke as string) || DEFAULT_TEXT_STYLE.stroke,
        strokeWidth: activeObject.strokeWidth || DEFAULT_TEXT_STYLE.strokeWidth,
      })
    } else {
      setTextState(defaultState)
    }
  }, [canvas])

  return {
    textState,
    updateSelectedText,
    syncWithSelectedObject,
    fonts: MEDIEVAL_FONTS,
  }
}

