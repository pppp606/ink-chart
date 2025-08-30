import { 
  red, red1, red2, red3, red4, red5, red6, red7, red8,
  blue1, blue2, blue3, blue4, blue5, blue6, blue7, blue8,
  green1, green2, green3, green4, green5, green6, green7, green8
} from './ansi.js';

/**
 * Color scheme type for threshold highlighting
 */
export type ColorScheme = 'red' | 'blue' | 'green';

/**
 * Threshold colorizer for applying gradient highlighting to symbols
 */
export class ThresholdColorizer {
  private readonly gradientColors: ((text: string) => string)[];

  constructor(private readonly colorScheme: ColorScheme = 'red') {
    this.gradientColors = this.getGradientColors(colorScheme);
  }

  /**
   * Gets gradient color functions based on color scheme
   */
  private getGradientColors(colorScheme: ColorScheme): ((text: string) => string)[] {
    switch (colorScheme) {
      case 'blue':
        return [blue1, blue2, blue3, blue4, blue5, blue6, blue7, blue8];
      case 'green':
        return [green1, green2, green3, green4, green5, green6, green7, green8];
      case 'red':
      default:
        return [red1, red2, red3, red4, red5, red6, red7, red8];
    }
  }

  /**
   * Applies single threshold highlighting
   */
  private applySingleThreshold(symbol: string, value: number, threshold: number): string {
    return value > threshold ? red(symbol) : symbol;
  }

  /**
   * Applies multiple threshold highlighting with gradient
   */
  private applyMultipleThresholds(symbol: string, value: number, thresholds: number[]): string {
    const sortedThresholds = [...thresholds].sort((a, b) => a - b);
    
    // Find the highest threshold exceeded
    let colorIndex = -1;
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (value > sortedThresholds[i]!) {
        colorIndex = Math.min(i, this.gradientColors.length - 1);
        break;
      }
    }
    
    if (colorIndex >= 0) {
      return this.gradientColors[colorIndex]!(symbol);
    }
    
    return symbol; // Below all thresholds
  }

  /**
   * Applies threshold highlighting to symbols array
   * @param symbols - Array of symbol characters
   * @param data - Original data values
   * @param threshold - Single threshold value or array of thresholds
   * @returns Highlighted symbols as a single string
   */
  public applyHighlighting(symbols: string[], data: number[], threshold: number | number[]): string {
    const highlightedSymbols = symbols.map((symbol, index) => {
      const originalValue = data[Math.floor((index / symbols.length) * data.length)];
      
      if (originalValue === undefined) {
        return symbol;
      }
      
      // Single threshold mode
      if (typeof threshold === 'number') {
        return this.applySingleThreshold(symbol, originalValue, threshold);
      }
      
      // Multiple thresholds mode (smooth gradient)
      return this.applyMultipleThresholds(symbol, originalValue, threshold);
    });
    
    return highlightedSymbols.join('');
  }
}