# ink-chart

Terminal visualization components for [Ink](https://github.com/vadimdemedes/ink), React CLI framework

## Preview

<img src="./assets/demo-preview.svg" alt="Demo Screenshot" width="730" />

## Features

- **BarChart** - Horizontal bar charts with individual row coloring and custom formatting
- **StackedBarChart** - 100% stacked horizontal bar charts showing percentage distribution
- **LineGraph** - High-resolution line graphs with multi-series support and axis labels
- **Sparkline** - Compact trend visualization with threshold highlighting and gradient colors
- **TypeScript** - Full TypeScript support with comprehensive type definitions
- **Auto-width** - Responsive charts that adapt to terminal width
- **Gradient Colors** - 8-level smooth color gradients with automatic terminal compatibility
- **Performance** - Optimized rendering with React.memo to prevent flickering

## Installation

```bash
npm install @pppp606/ink-chart
```

## Quick Start

```tsx
import React from 'react';
import { render, Text, Box } from 'ink';
import { BarChart, StackedBarChart, LineGraph, Sparkline } from '@pppp606/ink-chart';

function App() {
  return (
    <Box flexDirection="column">
      {/* Bar chart with values */}
      <BarChart
        data={[
          { label: 'Sales', value: 1250 },
          { label: 'Marketing', value: 800 }
        ]}
        showValue="right"
        sort="desc"
      />

      {/* Stacked bar chart showing distribution */}
      <StackedBarChart
        data={[
          { label: 'Complete', value: 75, color: '#4aaa1a' },
          { label: 'Remaining', value: 25, color: '#d89612' }
        ]}
      />

      {/* Line graph with multiple series */}
      <LineGraph
        data={[
          { values: [10, 15, 12, 18, 14, 20], color: 'red' },
          { values: [8, 12, 16, 14, 18, 16], color: 'blue' }
        ]}
        height={5}
        showYAxis={true}
        xLabels={['Jan', 'Jun']}
      />

      {/* Simple sparkline */}
      <Sparkline data={[1, 3, 2, 5, 4, 6, 3]} />
    </Box>
  );
}

render(<App />);
```

## Components

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
- `width?: 'auto' | 'full' | number` - Chart width (`'auto'`: natural content width, `'full'`: terminal width, `number`: fixed width)
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

### StackedBarChart

Stacked horizontal bar chart with two modes: 100% percentage distribution or absolute values.

```tsx
// Percentage mode (default) - 100% stacked
<StackedBarChart
  data={[
    { label: 'Sales', value: 30, color: '#4aaa1a' },
    { label: 'Warning', value: 20, color: '#d89612' },
    { label: 'Error', value: 50, color: '#a61d24' }
  ]}
  width={50}
/>

// Absolute mode - showing actual values
<StackedBarChart
  data={[
    { label: 'Downloads', value: 1250 },
    { label: 'Uploads', value: 450 }
  ]}
  mode="absolute"
  max={5000}
  format={(v, mode) => mode === 'percentage' ? `${v.toFixed(1)}%` : `${v}`}
  width={50}
/>
```

**Props:**
- `data: StackedBarSegment[]` - Array of segments to display
- `mode?: 'percentage' | 'absolute'` - Display mode (default: `'percentage'`)
  - `'percentage'`: 100% stacked showing percentage distribution
  - `'absolute'`: Stacked bar showing actual values scaled to max
- `max?: 'auto' | number` - Maximum value for scaling in absolute mode (default: `'auto'`)
- `width?: 'auto' | 'full' | number` - Chart width (`'auto'`: 40 characters default, `'full'`: terminal width, `number`: fixed width)
- `showLabels?: boolean` - Whether to show segment labels above bar (default: `true`)
- `showValues?: boolean` - Whether to show values below bar (default: `true`)
- `format?: (value: number, mode: StackedBarChartMode) => string` - Value formatter

**StackedBarSegment interface:**
```tsx
interface StackedBarSegment {
  label: string;
  value: number;
  color?: string; // Hex code or Ink color name
  char?: string;  // Custom character for this segment
}
```

### LineGraph

High-resolution line graph using Unicode scan line characters (⎺ ⎻ ─ ⎼ ⎽) for 5-level vertical resolution per row.

```tsx
<LineGraph
  data={[
    { values: [100, 120, 115, 130, 125, 140], color: 'red' },
    { values: [90, 110, 130, 120, 140, 130], color: 'blue' }
  ]}
  width={50}
  height={6}
  showYAxis={true}
  xLabels={['Q1', 'Q4']}
/>
```

Output:
```
   140│            ⎽    ⎽─⎺
      │    ⎼⎽  ⎽⎼⎽⎽─⎺ ⎽─⎻
      │ ⎼⎼⎽ ⎽⎼⎼⎼⎽⎽⎽⎼─⎻
      │⎼──⎼⎼⎼⎼─⎺⎺⎻⎺
      │⎻⎺─⎺
    90│⎺─⎻
      └──────────────────────
       Q1                  Q4
```

**Props:**
- `data: LineGraphSeries[]` - Array of data series (each with `values` and optional `color`)
- `width?: 'auto' | 'full' | number` - Chart width
- `height?: number` - Chart height in rows (default: 10, each row = 5 vertical levels)
- `yDomain?: 'auto' | [number, number]` - Y-axis range
- `showYAxis?: boolean` - Show Y-axis labels (default: false)
- `yLabels?: (string | number)[]` - Custom Y-axis labels (numbers: position-based, strings: evenly distributed)
- `xLabels?: (string | number)[]` - X-axis labels (numbers: position-based, strings: evenly distributed)
- `caption?: string` - Optional caption below chart

**LineGraphSeries interface:**
```tsx
interface LineGraphSeries {
  values: number[];
  color?: string; // Ink color name or hex
}
```

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
- `width?: 'auto' | 'full' | number` - Chart width (`'auto'`: data length, `'full'`: terminal width, `number`: fixed width)
- `threshold?: number | number[]` - Threshold(s) for highlighting (single or gradient)
- `colorScheme?: 'red' | 'blue' | 'green'` - Color scheme for gradient highlighting
- `mode?: 'block' | 'braille'` - Rendering mode
- `caption?: string` - Optional caption below chart

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

### Different Bar Characters

```tsx
// Full Block (█)
<BarChart
  data={[{ label: 'Progress', value: 75 }]}
  barChar="█"
  max={100}
/>

// Dark Shade (▓)
<BarChart
  data={[{ label: 'Progress', value: 75 }]}
  barChar="▓"
  max={100}
/>

// Medium Shade (▒)
<BarChart
  data={[{ label: 'Progress', value: 75 }]}
  barChar="▒"
  max={100}
/>

// Light Shade (░)
<BarChart
  data={[{ label: 'Progress', value: 75 }]}
  barChar="░"
  max={100}
/>
```

### Stacked Distribution (Percentage Mode)

```tsx
<StackedBarChart
  data={[
    { label: 'Development', value: 45, color: '#1890ff' },
    { label: 'Testing', value: 25, color: '#52c41a' },
    { label: 'Planning', value: 15, color: '#faad14' },
    { label: 'Meetings', value: 15, color: '#f5222d' }
  ]}
  width={60}
  format={(v) => `${v.toFixed(0)}%`}
/>
```

Output:
```
Development                Testing        Planning Meetings
████████████████████████████████████████████████████████████
45%                        25%            15%      15%
```
*Colors differentiate segments (not visible in plain text)*

### Stacked Distribution (Absolute Mode)

```tsx
<StackedBarChart
  data={[
    { label: 'CPU', value: 45, color: '#1890ff' },
    { label: 'Memory', value: 30, color: '#52c41a' },
    { label: 'Disk', value: 15, color: '#faad14' }
  ]}
  mode="absolute"
  max={100}
  width={60}
  format={(v, mode) => mode === 'percentage' ? `${v.toFixed(1)}%` : `${v.toFixed(0)}`}
/>
```

Output:
```
CPU                        Memory          Disk
███████████████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒
45                         30              15
```

## Demo

Try the interactive demo to see all features in action:

```bash
# Static examples - all chart features
npm run demo
```

The demo showcases:

**BarChart Examples:**
- Department performance comparison with sorting
- Multi-color status indicators (Success, Warnings, Errors)
- Different bar character styles (█, ▓, ▒, ░)

**StackedBarChart Examples:**
- **Percentage Mode**: 100% stacked bar showing percentage distribution
  ```
  Sales          Warning   Error
  ███████████████▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
  30.0%          20.0%     50.0%
  ```

- **Project Time Allocation**: Color-coded segments
  ```
  Development                Testing        Planning Meetings
  ████████████████████████████████████████████████████████████
  45%                        25%            15%      15%
  ```
  *Each segment uses the same character (█) but different colors*

- **Absolute Mode**: Server resource usage with actual values
  ```
  CPU                        Memory          Disk
  ███████████████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒
  45                         30              15
  ```

**LineGraph Examples:**
- **Temperature Trend**: High-resolution line with X-axis labels
  ```
                     ⎽⎼─⎺⎻⎻─⎼⎽
                  ⎽─⎻         ⎻─⎼
              ⎽⎼─⎺               ⎺─⎼
          ⎽⎼─⎺                      ⎺⎻⎼
       ⎽─⎻                             ⎺⎻⎼
   ⎽⎼─⎺                                   ⎺
   ────────────────────────────────────────
   Jan                                  Dec
  ```

- **Multi-Series Comparison**: Multiple data series with Y-axis
  ```
     160│                             ⎽    ⎽ ⎽─⎺⎺⎽⎼⎻⎺
        │                   ⎼⎽  ⎽⎼⎽⎽─⎺ ⎽─⎻⎺─⎺⎺⎻⎻⎺
        │         ⎼⎼⎽ ⎽⎼⎼⎼⎽⎽⎽⎼─⎻──⎻ ⎺⎺⎺
        │    ⎼──⎼⎼⎼⎼─⎺⎺⎻⎺
        │ ⎼⎻⎺─⎺
      90│⎺─⎻
        └────────────────────────────────────────────
         Q1                                        Q4
  ```
  *Red and blue lines show different series (colors not visible in plain text)*

**Sparkline Examples:**
- Server RPS (Requests Per Second) trend over 24 hours
- 8-level smooth color gradients (red, blue, green)
- Threshold highlighting with multiple gradient levels

## Advanced Features

### Smooth Color Gradients

8-level gradient highlighting with automatic terminal compatibility:

```tsx
<Sparkline 
  threshold={[10, 20, 30, 40, 50, 60, 70, 80]}
  colorScheme="blue" // red, blue, or green
/>
```

**Color Support:**
- **24-bit terminals** (iTerm, VSCode): Full RGB gradients
- **256-color terminals**: Palette-based gradients
- **16-color terminals**: Basic color fallbacks

Detection is automatic based on `COLORTERM`, `TERM`, and `TERM_PROGRAM` environment variables.

### Performance Optimization

Components are optimized with `React.memo` to prevent unnecessary re-renders:

```tsx
// Only re-renders when values actually change
<BarChart data={dynamicData} />
```

### Full-width Support

Charts can adapt to full terminal width:

```tsx
<Sparkline width="full" /> // Full terminal width
<BarChart width="full" />  // Full terminal width
```

## Security

This package implements comprehensive security practices:

- **Secure CI/CD**: SHA-pinned GitHub Actions with minimal permissions
- **Supply Chain Protection**: Provenance attestation and OIDC authentication
- **Secret Scanning**: Automated detection of accidentally committed secrets
- **Dependency Security**: Regular security audits and automated vulnerability scanning
- **Workflow Protection**: CODEOWNERS file and branch protection rules

For security policy, vulnerability reporting, and detailed security information, see [SECURITY.md](SECURITY.md).

## License

MIT