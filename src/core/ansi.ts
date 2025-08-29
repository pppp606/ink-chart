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
 * Apply orange color (RGB 255,165,0 approximated as bright yellow)
 */
export function orange(text: string): string {
  return colorize(text, '\u001b[38;5;214m'); // Orange color using 256-color palette
}

/**
 * Subtle red gradient colors for smooth transitions
 */
export function red1(text: string): string {
  return colorize(text, '\u001b[38;2;255;200;200m'); // Light red #FFC8C8 (more saturated)
}

export function red2(text: string): string {
  return colorize(text, '\u001b[38;2;255;180;180m'); // Soft red #FFB4B4
}

export function red3(text: string): string {
  return colorize(text, '\u001b[38;2;255;160;160m'); // Medium light red #FFA0A0
}

export function red4(text: string): string {
  return colorize(text, '\u001b[38;2;255;140;140m'); // Medium red #FF8C8C
}

export function red5(text: string): string {
  return colorize(text, '\u001b[38;2;255;160;160m'); // Medium red #FFA0A0
}

export function red6(text: string): string {
  return colorize(text, '\u001b[38;2;255;130;130m'); // Strong red #FF8282
}

export function red7(text: string): string {
  return colorize(text, '\u001b[38;2;255;100;100m'); // Vivid red #FF6464
}

export function red8(text: string): string {
  return colorize(text, '\u001b[38;2;220;50;50m'); // Deep red #DC3232
}

/**
 * Blue gradient colors for smooth transitions
 */
export function blue1(text: string): string {
  return colorize(text, '\u001b[38;2;200;200;255m'); // Light blue #C8C8FF
}

export function blue2(text: string): string {
  return colorize(text, '\u001b[38;2;180;180;255m'); // Soft blue #B4B4FF
}

export function blue3(text: string): string {
  return colorize(text, '\u001b[38;2;160;160;255m'); // Medium light blue #A0A0FF
}

export function blue4(text: string): string {
  return colorize(text, '\u001b[38;2;140;140;255m'); // Medium blue #8C8CFF
}

export function blue5(text: string): string {
  return colorize(text, '\u001b[38;2;120;120;255m'); // Strong blue #7878FF
}

export function blue6(text: string): string {
  return colorize(text, '\u001b[38;2;100;100;255m'); // Vivid blue #6464FF
}

export function blue7(text: string): string {
  return colorize(text, '\u001b[38;2;80;80;255m'); // Deep blue #5050FF
}

export function blue8(text: string): string {
  return colorize(text, '\u001b[38;2;50;50;220m'); // Dark blue #3232DC
}

/**
 * Green gradient colors for smooth transitions
 */
export function green1(text: string): string {
  return colorize(text, '\u001b[38;2;200;255;200m'); // Light green #C8FFC8
}

export function green2(text: string): string {
  return colorize(text, '\u001b[38;2;180;255;180m'); // Soft green #B4FFB4
}

export function green3(text: string): string {
  return colorize(text, '\u001b[38;2;160;255;160m'); // Medium light green #A0FFA0
}

export function green4(text: string): string {
  return colorize(text, '\u001b[38;2;140;255;140m'); // Medium green #8CFF8C
}

export function green5(text: string): string {
  return colorize(text, '\u001b[38;2;120;255;120m'); // Strong green #78FF78
}

export function green6(text: string): string {
  return colorize(text, '\u001b[38;2;100;255;100m'); // Vivid green #64FF64
}

export function green7(text: string): string {
  return colorize(text, '\u001b[38;2;80;220;80m'); // Deep green #50DC50
}

export function green8(text: string): string {
  return colorize(text, '\u001b[38;2;50;180;50m'); // Dark green #32B432
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