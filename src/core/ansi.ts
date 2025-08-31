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
 * Color depth detection is performed to provide appropriate fallbacks:
 * - 24-bit (truecolor): Full RGB color support with smooth gradients
 * - 256-color: Limited gradient support using 256-color palette
 * - 16-color: Basic colors only, no gradients
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
 * Color depth levels supported by terminals
 */
export type ColorDepth = 1 | 4 | 8; // 16-color, 256-color, 24-bit

/**
 * Detect terminal color depth based on environment variables
 */
export function getColorDepth(): ColorDepth {
  // Allow override for testing
  if (process.env.FORCE_COLOR_DEPTH) {
    const depth = parseInt(process.env.FORCE_COLOR_DEPTH, 10);
    if (depth === 1 || depth === 4 || depth === 8) {
      return depth;
    }
  }

  // 24-bit (truecolor) support
  if (process.env.COLORTERM === 'truecolor' || process.env.COLORTERM === '24bit') {
    return 8;
  }

  // Check TERM for 256-color support
  const term = process.env.TERM || '';
  if (term.includes('256color') || term.includes('256')) {
    return 4;
  }

  // Some terminals set TERM_PROGRAM
  const termProgram = process.env.TERM_PROGRAM || '';
  if (termProgram === 'iTerm.app' || termProgram === 'vscode') {
    return 8; // These terminals support truecolor
  }

  // Default to 16-color
  return 1;
}

// Cache color depth to avoid repeated environment checks
let cachedColorDepth: ColorDepth | null = null;

/**
 * Get cached color depth
 */
function getCachedColorDepth(): ColorDepth {
  if (cachedColorDepth === null) {
    cachedColorDepth = getColorDepth();
  }
  return cachedColorDepth;
}

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
 * 256-color palette codes for gradient fallbacks
 */
const PALETTE_256 = {
  // Red gradient (light to dark)
  RED_GRADIENT: [217, 224, 210, 203, 196, 160, 124, 88],
  // Blue gradient (light to dark)
  BLUE_GRADIENT: [189, 153, 147, 111, 105, 69, 63, 57],
  // Green gradient (light to dark)
  GREEN_GRADIENT: [194, 157, 120, 84, 77, 41, 35, 28],
  // Orange
  ORANGE: 214,
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
 * Apply orange color with appropriate fallback
 */
export function orange(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth >= 4) {
    // 256-color or better: use orange from palette
    return colorize(text, `\u001b[38;5;${PALETTE_256.ORANGE}m`);
  }
  
  // 16-color: fallback to yellow
  return colorize(text, ANSI.YELLOW);
}

/**
 * Subtle red gradient colors for smooth transitions
 */
export function red1(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;200;200m'); // Light red #FFC8C8
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[0]}m`);
  }
  return colorize(text, ANSI.BRIGHT_RED);
}

export function red2(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;180;180m'); // Soft red #FFB4B4
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[1]}m`);
  }
  return colorize(text, ANSI.BRIGHT_RED);
}

export function red3(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;160;160m'); // Medium light red #FFA0A0
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[2]}m`);
  }
  return colorize(text, ANSI.BRIGHT_RED);
}

export function red4(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;140;140m'); // Medium red #FF8C8C
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[3]}m`);
  }
  return colorize(text, ANSI.BRIGHT_RED);
}

export function red5(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;120;120m'); // Medium red #FF7878
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[4]}m`);
  }
  return colorize(text, ANSI.RED);
}

export function red6(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;100;100m'); // Strong red #FF6464
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[5]}m`);
  }
  return colorize(text, ANSI.RED);
}

export function red7(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;255;80;80m'); // Vivid red #FF5050
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[6]}m`);
  }
  return colorize(text, ANSI.RED);
}

export function red8(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;220;50;50m'); // Deep red #DC3232
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.RED_GRADIENT[7]}m`);
  }
  return colorize(text, ANSI.RED);
}

/**
 * Blue gradient colors for smooth transitions
 */
export function blue1(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;200;200;255m'); // Light blue #C8C8FF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[0]}m`);
  }
  return colorize(text, ANSI.BRIGHT_BLUE);
}

export function blue2(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;180;180;255m'); // Soft blue #B4B4FF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[1]}m`);
  }
  return colorize(text, ANSI.BRIGHT_BLUE);
}

export function blue3(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;160;160;255m'); // Medium light blue #A0A0FF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[2]}m`);
  }
  return colorize(text, ANSI.BRIGHT_BLUE);
}

export function blue4(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;140;140;255m'); // Medium blue #8C8CFF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[3]}m`);
  }
  return colorize(text, ANSI.BRIGHT_BLUE);
}

export function blue5(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;120;120;255m'); // Strong blue #7878FF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[4]}m`);
  }
  return colorize(text, ANSI.BLUE);
}

export function blue6(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;100;100;255m'); // Vivid blue #6464FF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[5]}m`);
  }
  return colorize(text, ANSI.BLUE);
}

export function blue7(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;80;80;255m'); // Deep blue #5050FF
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[6]}m`);
  }
  return colorize(text, ANSI.BLUE);
}

export function blue8(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;50;50;220m'); // Dark blue #3232DC
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.BLUE_GRADIENT[7]}m`);
  }
  return colorize(text, ANSI.BLUE);
}

/**
 * Green gradient colors for smooth transitions
 */
export function green1(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;200;255;200m'); // Light green #C8FFC8
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[0]}m`);
  }
  return colorize(text, ANSI.BRIGHT_GREEN);
}

export function green2(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;180;255;180m'); // Soft green #B4FFB4
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[1]}m`);
  }
  return colorize(text, ANSI.BRIGHT_GREEN);
}

export function green3(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;160;255;160m'); // Medium light green #A0FFA0
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[2]}m`);
  }
  return colorize(text, ANSI.BRIGHT_GREEN);
}

export function green4(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;140;255;140m'); // Medium green #8CFF8C
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[3]}m`);
  }
  return colorize(text, ANSI.BRIGHT_GREEN);
}

export function green5(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;120;255;120m'); // Strong green #78FF78
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[4]}m`);
  }
  return colorize(text, ANSI.GREEN);
}

export function green6(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;100;255;100m'); // Vivid green #64FF64
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[5]}m`);
  }
  return colorize(text, ANSI.GREEN);
}

export function green7(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;80;220;80m'); // Deep green #50DC50
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[6]}m`);
  }
  return colorize(text, ANSI.GREEN);
}

export function green8(text: string): string {
  const depth = getCachedColorDepth();
  
  if (depth === 8) {
    return colorize(text, '\u001b[38;2;50;180;50m'); // Dark green #32B432
  } else if (depth === 4) {
    return colorize(text, `\u001b[38;5;${PALETTE_256.GREEN_GRADIENT[7]}m`);
  }
  return colorize(text, ANSI.GREEN);
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

/**
 * Reset cached color depth (mainly for testing)
 */
export function resetColorDepthCache(): void {
  cachedColorDepth = null;
}