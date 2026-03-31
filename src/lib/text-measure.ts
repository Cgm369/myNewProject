import { prepare, layout } from '@chenglou/pretext'

const FONT_FAMILY = '16px Inter, system-ui, "Segoe UI", Roboto, sans-serif'

export interface TextLayoutResult {
  height: number
  lineCount: number
}

export function measureTextLayout(
  text: string,
  maxWidth: number,
  fontSize: number = 16,
  lineHeight: number = 1.6
): TextLayoutResult {
  const prepared = prepare(text, `${fontSize}px Inter, system-ui, "Segoe UI", Roboto, sans-serif`)
  const result = layout(prepared, maxWidth, fontSize * lineHeight)
  
  return {
    height: result.height,
    lineCount: result.lineCount,
  }
}

export function preloadTextHeight(
  text: string,
  containerWidth: number,
  fontSize: number = 16,
  lineHeight: number = 1.6
): number {
  const result = measureTextLayout(text, containerWidth, fontSize, lineHeight)
  return result.height
}
