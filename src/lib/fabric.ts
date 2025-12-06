import { IText } from 'fabric'

// English fonts
export const ENGLISH_FONTS = [
  'Bangers',
  'UnifrakturMaguntia',
  'Press Start 2P',
  'Comic Neue',
  'Impact',
  'Georgia',
  'Arial',
  'Comic Sans MS',
] as const

// Cyrillic fonts
export const CYRILLIC_FONTS = [
  'Roboto',
  'PT Sans',
  'Oswald',
  'Montserrat',
  'Rubik',
  'Open Sans',
] as const

// All fonts combined for backwards compatibility
export const MEDIEVAL_FONTS = [
  ...ENGLISH_FONTS,
  ...CYRILLIC_FONTS,
] as const

export type MedievalFont = typeof MEDIEVAL_FONTS[number]

export const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Bangers',
  fontSize: 40,
  fill: '#FFFFFF',
  stroke: '#000000',
  strokeWidth: 0,
  textAlign: 'center' as const,
  originX: 'center' as const,
  originY: 'center' as const,
}

export function createTextObject(
  text: string,
  options: Partial<typeof DEFAULT_TEXT_STYLE> = {}
): IText {
  return new IText(text, {
    ...DEFAULT_TEXT_STYLE,
    ...options,
    editable: true,
    selectable: true,
  } as any)
}

