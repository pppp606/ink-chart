// Main Components
export { Sparkline } from './components/Sparkline.js';
export { BarChart } from './components/BarChart.js';

// Component Types
export type { SparklineProps } from './components/Sparkline.js';
export type { BarChartProps, BarChartData } from './components/BarChart.js';

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