// Main Components
export { Sparkline } from './components/Sparkline.js';
export { BarChart } from './components/BarChart.js';
export { StackedBarChart } from './components/StackedBarChart.js';

// Component Types
export type { SparklineProps } from './components/Sparkline.js';
export type { BarChartProps, BarChartData } from './components/BarChart.js';
export type { StackedBarChartProps, StackedBarSegment } from './components/StackedBarChart.js';

// Hooks
export { useAutoWidth } from './core/useAutoWidth.js';
export type { UseAutoWidthResult } from './core/useAutoWidth.js';

// Core Utilities (for advanced usage)
export { 
  valuesToSymbols, 
  getSymbol, 
  BLOCK_SYMBOLS, 
  BRAILLE_SYMBOLS 
} from './core/symbols.js';

export { 
  red, 
  yellow, 
  green, 
  cyan, 
  bold, 
  dim,
  colorize,
  hasAnsi,
  stripAnsi,
  ANSI 
} from './core/ansi.js';