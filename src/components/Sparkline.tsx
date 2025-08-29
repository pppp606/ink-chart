import React from 'react';
import { Text, Box } from 'ink';
import { valuesToSymbols } from '../core/symbols.js';
import { red } from '../core/ansi.js';

export interface SparklineProps {
  data: number[];
  width?: 'auto' | number;
  height?: 1 | 2 | 'braille';
  mode?: 'braille' | 'block';
  yDomain?: 'auto' | [number, number];
  threshold?: number;
  caption?: string;
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

  // Handle empty data
  if (data.length === 0) {
    return null;
  }

  // Process data based on yDomain
  let processedData = data;
  let isPreNormalized = false;
  
  if (yDomain !== 'auto') {
    const [min, max] = yDomain;
    const range = max - min;
    
    if (range === 0) {
      // If domain range is zero, use middle symbol for all values
      processedData = data.map(() => 0.5);
    } else {
      // Normalize data to 0-1 based on fixed domain
      processedData = data.map(value => {
        // Clamp to domain range
        const clampedValue = Math.max(min, Math.min(max, value));
        return (clampedValue - min) / range;
      });
    }
    isPreNormalized = true;
  }

  // Generate symbols for the sparkline
  let symbols = valuesToSymbols(processedData, mode, isPreNormalized);

  // Handle width specification
  if (typeof width === 'number' && width !== symbols.length) {
    if (width > symbols.length) {
      // Interpolate or repeat symbols to match width
      const newSymbols: string[] = [];
      for (let i = 0; i < width; i++) {
        const sourceIndex = Math.floor((i / width) * symbols.length);
        newSymbols.push(symbols[sourceIndex] || symbols[symbols.length - 1]!);
      }
      symbols = newSymbols;
    } else if (width < symbols.length) {
      // Sample symbols to match width
      const newSymbols: string[] = [];
      for (let i = 0; i < width; i++) {
        const sourceIndex = Math.floor((i / width) * symbols.length);
        newSymbols.push(symbols[sourceIndex]!);
      }
      symbols = newSymbols;
    }
  }

  // Apply threshold highlighting
  let sparklineText = symbols.join('');
  if (threshold !== undefined) {
    const highlightedSymbols = symbols.map((symbol, index) => {
      const originalValue = data[Math.floor((index / symbols.length) * data.length)];
      return originalValue !== undefined && originalValue > threshold ? red(symbol) : symbol;
    });
    sparklineText = highlightedSymbols.join('');
  }

  // Render component
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