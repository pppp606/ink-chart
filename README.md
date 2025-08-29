# ink-chart

Small visualization components for ink CLI framework

## Features

- **Sparkline** - Compact trend visualization with threshold highlighting and gradient colors
- **BarChart** - Horizontal bar charts with individual row coloring and custom formatting
- **TypeScript** - Full TypeScript support with comprehensive type definitions
- **Auto-width** - Responsive charts that adapt to terminal width
- **Gradient Colors** - 8-level smooth color gradients using 24-bit RGB
- **Performance** - Optimized rendering with React.memo to prevent flickering

## Installation

```bash
npm install ink-chart
```

## Quick Start

```tsx
import React from 'react';
import { render, Text, Box } from 'ink';
import { Sparkline, BarChart } from 'ink-chart';

function App() {
  return (
    <Box flexDirection="column">
      {/* Simple sparkline */}
      <Sparkline data={[1, 3, 2, 5, 4, 6, 3]} />
      
      {/* Bar chart with values */}
      <BarChart 
        data={[
          { label: 'Sales', value: 1250 },
          { label: 'Marketing', value: 800 }
        ]}
        showValue="right"
        sort="desc"
      />
    </Box>
  );
}

render(<App />);
```

## Components

### Sparkline

Compact trend visualization perfect for displaying time series data.

```tsx
<Sparkline 
  data={[1, 3, 2, 8, 4]}
  width={30}
  threshold={5}
  colorScheme="red"
  caption="Sales Trend"
/>
```

**Props:**
- `data: number[]` - Array of numeric values
- `width?: 'auto' | 'max' | number` - Chart width (`'auto'`: data length, `'max'`: terminal width, `number`: fixed width)
- `threshold?: number | number[]` - Threshold(s) for highlighting (single or gradient)
- `colorScheme?: 'red' | 'blue' | 'green'` - Color scheme for gradient highlighting
- `mode?: 'block' | 'braille'` - Rendering mode
- `caption?: string` - Optional caption below chart

### BarChart

Horizontal bar charts with customizable appearance and individual row colors.

```tsx
<BarChart 
  data={[
    { label: 'Success', value: 22, color: '#4aaa1a' },
    { label: 'Warnings', value: 8, color: '#d89612' },
    { label: 'Errors', value: 15, color: '#a61d24' }
  ]}
  showValue="right"
  width={50}
  format={(v) => `${v}%`}
/>
```

**Props:**
- `data: BarChartData[]` - Array of data points
- `sort?: 'none' | 'asc' | 'desc'` - Sort order
- `showValue?: 'right' | 'inside' | 'none'` - Value display position
- `width?: 'auto' | number` - Chart width
- `max?: 'auto' | number` - Maximum value for scaling
- `format?: (value: number) => string` - Value formatter
- `barChar?: '▆' | '█' | '▓' | '▒' | '░'` - Bar character
- `color?: string` - Default color (overridden by individual `BarChartData.color`)

**BarChartData interface:**
```tsx
interface BarChartData {
  label: string;
  value: number;
  color?: string; // Hex code or Ink color name
}
```

## Examples

### Gradient Highlighting

```tsx
// 8-level smooth gradient
<Sparkline 
  data={[45, 55, 65, 75, 85, 95, 85, 75]}
  threshold={[55, 62, 68, 74, 79, 84, 89, 94]}
  colorScheme="red"
/>
```

### Custom Formatting

```tsx
<BarChart 
  data={[
    { label: 'Q1', value: 125000 },
    { label: 'Q2', value: 180000 }
  ]}
  format={(v) => `$${(v/1000)}K`}
  showValue="right"
/>
```

### Individual Colors

```tsx
<BarChart 
  data={[
    { label: 'Success', value: 85, color: '#4aaa1a' },
    { label: 'Warning', value: 12, color: '#d89612' },
    { label: 'Error', value: 3, color: '#a61d24' }
  ]}
/>
```

## Demo

Try the interactive demos to see all features:

```bash
# Static examples - all chart features
npm run demo

# Dynamic examples - live updating charts  
npm run demo:dynamic
```

## Advanced Features

### Smooth Color Gradients

8-level gradient highlighting using 24-bit RGB colors:

```tsx
<Sparkline 
  threshold={[10, 20, 30, 40, 50, 60, 70, 80]}
  colorScheme="blue" // red, blue, or green
/>
```

### Performance Optimization

Components are optimized with `React.memo` to prevent unnecessary re-renders:

```tsx
// Only re-renders when values actually change
<BarChart data={dynamicData} />
```

### Auto-width Support

Charts automatically adapt to terminal width:

```tsx
<Sparkline width="max" /> // Full terminal width
<BarChart width="auto" />  // Natural content width
```

## License

MIT