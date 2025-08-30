/**
 * Width calculation utilities for terminal components
 */

/** Default margin for terminal width calculations */
export const DEFAULT_TERMINAL_MARGIN = 4;

/** Minimum safe width for components */
export const MIN_COMPONENT_WIDTH = 10;

/**
 * Calculates effective width based on width configuration and terminal width
 * @param width - Width configuration ('auto', 'full', or specific number)
 * @param terminalWidth - Current terminal width
 * @returns Effective width value ('auto' or specific number)
 */
export function calculateEffectiveWidth(
  width: 'auto' | 'full' | number,
  terminalWidth: number
): 'auto' | number {
  if (width === 'full') {
    return Math.max(MIN_COMPONENT_WIDTH, terminalWidth - DEFAULT_TERMINAL_MARGIN);
  }
  return width;
}

/**
 * Gets terminal width with safety margin to prevent line wrapping
 * @param columns - Raw terminal columns (process.stdout.columns)
 * @param margin - Margin to subtract (defaults to 2 for safety)
 * @returns Safe terminal width
 */
export function getSafeTerminalWidth(columns: number | undefined, margin: number = 2): number {
  const baseWidth = typeof columns === 'number' && columns > 0 ? columns : 80;
  return Math.max(MIN_COMPONENT_WIDTH, baseWidth - margin);
}