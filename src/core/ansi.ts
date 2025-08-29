/**
 * ANSI color and styling utilities for terminal output.
 * 
 * This module provides a comprehensive set of functions for applying colors and 
 * styles to text in terminal applications. It uses standard ANSI escape sequences
 * that are widely supported across different terminal emulators.
 * 
 * The module includes both basic and bright color variants, as well as text
 * styling options like bold and dim. All functions automatically handle the
 * reset sequence to ensure proper color isolation.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const redText = red('Error message');
 * const boldText = bold('Important info');
 * 
 * // Combining styles
 * const styledText = bold(red('Critical alert'));
 * 
 * // Utility functions
 * const hasColors = hasAnsi(redText);     // true
 * const cleanText = stripAnsi(redText);   // 'Error message' 
 * ```
 */

/**
 * ANSI escape codes for colors and styling
 */
export const ANSI = {
  // Colors
  RED: '\u001b[31m',
  GREEN: '\u001b[32m',
  YELLOW: '\u001b[33m',
  BLUE: '\u001b[34m',
  MAGENTA: '\u001b[35m',
  CYAN: '\u001b[36m',
  WHITE: '\u001b[37m',
  
  // Bright colors
  BRIGHT_RED: '\u001b[91m',
  BRIGHT_GREEN: '\u001b[92m',
  BRIGHT_YELLOW: '\u001b[93m',
  BRIGHT_BLUE: '\u001b[94m',
  BRIGHT_MAGENTA: '\u001b[95m',
  BRIGHT_CYAN: '\u001b[96m',
  BRIGHT_WHITE: '\u001b[97m',
  
  // Styles
  BOLD: '\u001b[1m',
  DIM: '\u001b[2m',
  UNDERLINE: '\u001b[4m',
  
  // Reset
  RESET: '\u001b[0m',
} as const;

/**
 * Apply ANSI color to text
 */
export function colorize(text: string, color: string): string {
  return `${color}${text}${ANSI.RESET}`;
}

/**
 * Apply red color (typically for threshold highlighting)
 */
export function red(text: string): string {
  return colorize(text, ANSI.BRIGHT_RED);
}

/**
 * Apply yellow color (typically for warnings)
 */
export function yellow(text: string): string {
  return colorize(text, ANSI.BRIGHT_YELLOW);
}

/**
 * Apply green color (typically for positive values)
 */
export function green(text: string): string {
  return colorize(text, ANSI.BRIGHT_GREEN);
}

/**
 * Apply cyan color (typically for highlights)
 */
export function cyan(text: string): string {
  return colorize(text, ANSI.BRIGHT_CYAN);
}

/**
 * Apply bold styling
 */
export function bold(text: string): string {
  return `${ANSI.BOLD}${text}${ANSI.RESET}`;
}

/**
 * Apply dim styling
 */
export function dim(text: string): string {
  return `${ANSI.DIM}${text}${ANSI.RESET}`;
}

/**
 * Check if string contains ANSI escape codes
 */
export function hasAnsi(text: string): boolean {
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\u001b\[[0-9;]*[a-zA-Z]/g;
  return ansiRegex.test(text);
}

/**
 * Remove ANSI escape codes from string
 */
export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\u001b\[[0-9;]*[a-zA-Z]/g;
  return text.replace(ansiRegex, '');
}