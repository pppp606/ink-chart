import React from 'react';
import { Text, Box } from 'ink';
import { valuesToSymbols } from '../core/symbols.js';
import { red } from '../core/ansi.js';

/**
 * Props for the Sparkline component
 */
export interface SparklineProps {
  /** 
   * Array of numeric values to visualize 
   */
  data: number[];
  
  /** 
   * Width of the sparkline in characters. 
   * - 'auto': Uses the length of the data array
   * - number: Fixed width, data will be interpolated to fit
   */
  width?: 'auto' | number;
  
  /** 
   * Height of the sparkline (future use, currently unused) 
   */
  height?: 1 | 2 | 'braille';
  
  /** 
   * Rendering mode for the sparkline symbols
   * - 'block': Uses block drawing characters (▁▂▃▄▅▆▇█)
   * - 'braille': Uses braille dot patterns (⠀⠄⠆⠇⠏⠟⠿⣿)
   */
  mode?: 'braille' | 'block';
  
  /** 
   * Y-axis domain for value mapping
   * - 'auto': Automatically scales to min/max of data
   * - [min, max]: Fixed domain range for consistent scaling across datasets
   */
  yDomain?: 'auto' | [number, number];
  
  /** 
   * Threshold value for highlighting. Values above this will be colored red.
   */
  threshold?: number;
  
  /** 
   * Optional caption to display below the sparkline
   */
  caption?: string;
}

/**
 * A compact sparkline component for visualizing numeric trends in terminal applications.
 * 
 * Sparklines are small, high-resolution graphics embedded in text that provide 
 * a quick visual summary of data trends. This component renders sparklines using 
 * Unicode block or braille characters, making them perfect for CLI applications 
 * and terminal-based dashboards.
 * 
 * @example
 * ```tsx
 * // Basic usage with auto-scaling
 * <Sparkline data={[1, 3, 2, 5, 4]} />
 * 
 * // Fixed width with threshold highlighting
 * <Sparkline 
 *   data={[1, 3, 2, 8, 4]} 
 *   width={20} 
 *   threshold={5}
 *   caption="Sales Trend"
 * />
 * 
 * // Fixed domain for consistent scaling
 * <Sparkline 
 *   data={[20, 30, 40]} 
 *   yDomain={[0, 100]}
 *   mode="braille"
 * />
 * ```
 * 
 * @param props - Component properties
 * @returns React element containing the rendered sparkline, or null for empty data
 */
/**
 * Processes data based on the yDomain configuration
 * @param data - Raw numeric data
 * @param yDomain - Domain configuration 
 * @returns Object with processed data and normalization flag
 */
function processDataWithDomain(data: number[], yDomain: SparklineProps['yDomain']) {
  if (yDomain === 'auto') {
    return { processedData: data, isPreNormalized: false };
  }

  // TypeScript now knows yDomain is [number, number]
  const [min, max] = yDomain as [number, number];
  const range = max - min;
  
  // Handle edge cases with domain values
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    console.warn('Sparkline: yDomain contains non-finite values, falling back to auto scaling');
    return { processedData: data, isPreNormalized: false };
  }
  
  if (range < 0) {
    console.warn('Sparkline: yDomain min is greater than max, swapping values');
    const [swappedMin, swappedMax] = [max, min];
    const swappedRange = swappedMax - swappedMin;
    
    if (swappedRange === 0) {
      return { processedData: data.map(() => 0.5), isPreNormalized: true };
    }
    
    const processedData = data.map(value => {
      const clampedValue = Math.max(swappedMin, Math.min(swappedMax, value));
      return (clampedValue - swappedMin) / swappedRange;
    });
    return { processedData, isPreNormalized: true };
  }
  
  if (range === 0) {
    // If domain range is zero, use middle symbol for all values
    return { processedData: data.map(() => 0.5), isPreNormalized: true };
  }

  // Normalize data to 0-1 based on fixed domain
  const processedData = data.map(value => {
    // Handle non-finite input values
    if (!Number.isFinite(value)) {
      return 0.5; // Use middle value for invalid data
    }
    
    // Clamp to domain range
    const clampedValue = Math.max(min, Math.min(max, value));
    return (clampedValue - min) / range;
  });

  return { processedData, isPreNormalized: true };
}

/**
 * Scales symbols array to match target width
 * @param symbols - Array of symbol characters
 * @param targetWidth - Desired width in characters
 * @returns Scaled symbols array
 */
function scaleSymbolsToWidth(symbols: string[], targetWidth: number): string[] {
  if (targetWidth === symbols.length) {
    return symbols;
  }

  const newSymbols: string[] = [];
  
  if (targetWidth > symbols.length) {
    // Interpolate or repeat symbols to match width
    for (let i = 0; i < targetWidth; i++) {
      const sourceIndex = Math.floor((i / targetWidth) * symbols.length);
      newSymbols.push(symbols[sourceIndex] || symbols[symbols.length - 1]!);
    }
  } else {
    // Sample symbols to match width  
    for (let i = 0; i < targetWidth; i++) {
      const sourceIndex = Math.floor((i / targetWidth) * symbols.length);
      newSymbols.push(symbols[sourceIndex]!);
    }
  }

  return newSymbols;
}

/**
 * Applies threshold highlighting to symbols
 * @param symbols - Array of symbol characters
 * @param data - Original data values
 * @param threshold - Threshold value for highlighting
 * @returns Highlighted symbols as a single string
 */
function applyThresholdHighlighting(symbols: string[], data: number[], threshold: number): string {
  const highlightedSymbols = symbols.map((symbol, index) => {
    const originalValue = data[Math.floor((index / symbols.length) * data.length)];
    return originalValue !== undefined && originalValue > threshold ? red(symbol) : symbol;
  });
  
  return highlightedSymbols.join('');
}

export function Sparkline(props: SparklineProps): React.ReactElement | null {
  const {
    data,
    width = 'auto',
    mode = 'block',
    yDomain = 'auto',
    threshold,
    caption
  } = props;

  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return null;
  }

  // Validate width parameter
  if (typeof width === 'number' && (width <= 0 || !Number.isInteger(width))) {
    console.warn('Sparkline: width must be a positive integer, falling back to auto');
    // Continue with auto width behavior
  }

  // Filter out non-finite values and warn if found
  const validData = data.filter(Number.isFinite);
  if (validData.length !== data.length) {
    console.warn(`Sparkline: ${data.length - validData.length} non-finite values removed from data`);
  }

  // Handle case where all data was invalid
  if (validData.length === 0) {
    console.warn('Sparkline: No valid data points found');
    return null;
  }

  // Process data based on yDomain configuration
  const { processedData, isPreNormalized } = processDataWithDomain(validData, yDomain);

  // Generate symbols for the sparkline
  let symbols = valuesToSymbols(processedData, mode, isPreNormalized);

  // Handle width specification
  if (typeof width === 'number' && width > 0 && Number.isInteger(width)) {
    symbols = scaleSymbolsToWidth(symbols, width);
  }

  // Apply threshold highlighting if specified
  const sparklineText = threshold !== undefined 
    ? applyThresholdHighlighting(symbols, validData, threshold)
    : symbols.join('');

  // Render component with or without caption
  if (caption && caption.trim() !== '') {
    return (
      <Box flexDirection="column">
        <Text>{sparklineText}</Text>
        <Text>{caption}</Text>
      </Box>
    );
  }

  return <Text>{sparklineText}</Text>;
}