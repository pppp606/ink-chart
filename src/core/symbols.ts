/**
 * Symbol mappings and utilities for rendering sparklines in terminal applications.
 * 
 * This module provides Unicode character sets and functions for converting numeric
 * data into visual sparkline representations using block drawing and braille patterns.
 */

/**
 * Block drawing characters for sparkline rendering.
 * 
 * These Unicode characters represent 8 different height levels from lowest to highest,
 * creating a classic "bar chart" style sparkline appearance. They provide excellent
 * visual clarity and are widely supported across terminal applications.
 * 
 * @example
 * ```
 * ▁▂▃▄▅▆▇█  // Ascending values
 * ████▅▃▂▁  // Descending values  
 * ▁▄█▄▁    // Peak in middle
 * ```
 */
export const BLOCK_SYMBOLS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

/**
 * Braille characters for sparkline rendering.
 * 
 * These characters use braille dot patterns to represent different values/densities.
 * Braille mode can provide more compact representations and works well in contexts
 * where block characters might be too visually heavy.
 * 
 * @example  
 * ```
 * ⠀⠄⠆⠇⠏⠟⠿⣿  // Ascending dot density
 * ⣿⠿⠟⠏⠇⠆⠄⠀  // Descending dot density
 * ```
 */
export const BRAILLE_SYMBOLS = [
  '⠀', // Empty (0 dots)
  '⠄', // 1 dot
  '⠆', // 2 dots
  '⠇', // 3 dots  
  '⠏', // 4 dots
  '⠟', // 5 dots
  '⠿', // 6 dots
  '⣿', // 8 dots (full)
] as const;

/**
 * Maps a normalized value (0-1) to an appropriate symbol character.
 * 
 * This function takes a value between 0 and 1 and returns the corresponding
 * symbol from the selected character set. Values are automatically clamped
 * to the 0-1 range for safety.
 * 
 * @param value - Normalized value between 0 and 1 (will be clamped)
 * @param mode - Symbol mode ('block' for bar-style, 'braille' for dot-style)
 * @returns Unicode character representing the value
 * 
 * @example
 * ```typescript
 * getSymbol(0, 'block')    // '▁' (minimum)
 * getSymbol(1, 'block')    // '█' (maximum)  
 * getSymbol(0.5, 'block')  // '▄' (middle)
 * getSymbol(0, 'braille')  // '⠀' (empty)
 * getSymbol(1, 'braille')  // '⣿' (full)
 * ```
 */
export function getSymbol(value: number, mode: 'block' | 'braille' = 'block'): string {
  // Clamp value to 0-1 range for safety
  const normalizedValue = Math.max(0, Math.min(1, value));
  
  const symbols = mode === 'braille' ? BRAILLE_SYMBOLS : BLOCK_SYMBOLS;
  
  // Map to symbol index (0 to symbols.length - 1)
  const index = Math.floor(normalizedValue * (symbols.length - 1));
  
  return symbols[index]!;
}

/**
 * Converts an array of numeric values into sparkline symbol characters.
 * 
 * This is the primary function for generating sparklines. It handles both
 * automatic normalization (scaling to the data's min/max range) and 
 * pre-normalized data (values already in the 0-1 range).
 * 
 * @param values - Array of numeric values to convert
 * @param mode - Symbol mode ('block' for bar-style, 'braille' for dot-style)  
 * @param preNormalized - Whether values are already normalized to 0-1 range
 * @returns Array of symbol characters representing the data
 * 
 * @example
 * ```typescript
 * // Auto-normalized data
 * valuesToSymbols([1, 3, 2, 5, 4])         // ['▁', '▅', '▃', '█', '▆']
 * 
 * // Pre-normalized data (0-1 range)
 * valuesToSymbols([0, 0.5, 1], 'block', true)  // ['▁', '▄', '█']
 * 
 * // Uniform data (all same value)
 * valuesToSymbols([5, 5, 5])               // ['▄', '▄', '▄'] (middle symbol)
 * 
 * // Braille mode
 * valuesToSymbols([1, 2, 3], 'braille')    // ['⠀', '⠏', '⣿']
 * ```
 */
export function valuesToSymbols(
  values: number[],
  mode: 'block' | 'braille' = 'block',
  preNormalized: boolean = false
): string[] {
  if (values.length === 0) return [];
  
  // If values are pre-normalized (0-1 range), use them directly
  if (preNormalized) {
    return values.map(value => getSymbol(value, mode));
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  // Handle case where all values are the same
  if (range === 0) {
    // Use middle symbol for uniform values
    const symbols = mode === 'braille' ? BRAILLE_SYMBOLS : BLOCK_SYMBOLS;
    const middleIndex = Math.floor(symbols.length / 2);
    return values.map(() => symbols[middleIndex]!);
  }
  
  return values.map(value => {
    const normalized = (value - min) / range;
    return getSymbol(normalized, mode);
  });
}