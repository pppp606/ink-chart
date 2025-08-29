/**
 * Symbol mappings for different sparkline rendering modes
 */

/**
 * Block drawing characters for sparkline rendering
 * Represents 8 different height levels from lowest to highest
 */
export const BLOCK_SYMBOLS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

/**
 * Braille characters for sparkline rendering
 * Uses dots to represent different values/densities
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
 * Get symbol for a normalized value (0-1) in the specified mode
 */
export function getSymbol(value: number, mode: 'block' | 'braille' = 'block'): string {
  // Clamp value to 0-1 range
  const normalizedValue = Math.max(0, Math.min(1, value));
  
  const symbols = mode === 'braille' ? BRAILLE_SYMBOLS : BLOCK_SYMBOLS;
  
  // Map to symbol index (0 to symbols.length - 1)
  const index = Math.floor(normalizedValue * (symbols.length - 1));
  
  return symbols[index]!;
}

/**
 * Map array of values to sparkline symbols
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