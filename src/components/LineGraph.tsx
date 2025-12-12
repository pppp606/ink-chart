import React from 'react';
import { Text, Box } from 'ink';
import { useAutoWidth } from '../core/useAutoWidth.js';
import { calculateEffectiveWidth } from '../core/widthUtils.js';

/**
 * Dot character options for the line graph
 */
export type DotChar = '.' | '●' | '○' | '◆' | '◇' | '•' | '*';

/**
 * Props for the LineGraph component
 */
export interface LineGraphProps {
  /**
   * Array of numeric values to visualize
   */
  data: number[];

  /**
   * Width of the graph in characters.
   * - 'auto': Uses the length of the data array
   * - 'full': Uses full terminal width with margin
   * - number: Fixed width, data will be sampled/interpolated to fit
   */
  width?: 'auto' | 'full' | number;

  /**
   * Height of the graph in rows (lines)
   * @default 10
   */
  height?: number;

  /**
   * Y-axis domain for value mapping
   * - 'auto': Automatically scales to min/max of data
   * - [min, max]: Fixed domain range for consistent scaling
   */
  yDomain?: 'auto' | [number, number];

  /**
   * Character used for data points
   * @default '.'
   */
  dotChar?: DotChar;

  /**
   * Character used for empty space
   * @default ' '
   */
  emptyChar?: string;

  /**
   * Color for the dots (ink color name)
   */
  color?: string;

  /**
   * Optional caption to display below the graph
   */
  caption?: string;

  /**
   * Whether to show Y-axis labels
   * @default false
   */
  showYAxis?: boolean;
}

/**
 * Creates a 2D grid filled with empty characters
 */
function createGrid(width: number, height: number, emptyChar: string): string[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => emptyChar)
  );
}

/**
 * Normalizes a value to a row index (0 = top, height-1 = bottom)
 */
function valueToRowIndex(
  value: number,
  min: number,
  max: number,
  height: number
): number {
  if (max === min) {
    return Math.floor(height / 2);
  }
  const normalized = (value - min) / (max - min);
  // Clamp to [0, 1]
  const clamped = Math.max(0, Math.min(1, normalized));
  // Convert to row index (inverted: higher values = lower row index)
  const rowIndex = Math.round((1 - clamped) * (height - 1));
  return rowIndex;
}

/**
 * Scales data to match target width
 */
function scaleDataToWidth(data: number[], targetWidth: number): number[] {
  if (data.length === targetWidth) {
    return data;
  }

  const scaled: number[] = [];
  for (let i = 0; i < targetWidth; i++) {
    const sourceIndex = (i / (targetWidth - 1)) * (data.length - 1);
    const lowerIndex = Math.floor(sourceIndex);
    const upperIndex = Math.ceil(sourceIndex);
    const fraction = sourceIndex - lowerIndex;

    if (lowerIndex === upperIndex || upperIndex >= data.length) {
      scaled.push(data[lowerIndex] ?? data[data.length - 1]!);
    } else {
      // Linear interpolation
      const lowerValue = data[lowerIndex]!;
      const upperValue = data[upperIndex]!;
      scaled.push(lowerValue + fraction * (upperValue - lowerValue));
    }
  }

  return scaled;
}

/**
 * Formats Y-axis label
 */
function formatAxisLabel(value: number, maxLabelWidth: number): string {
  let label: string;
  if (Math.abs(value) >= 1000) {
    label = value.toExponential(0);
  } else if (Number.isInteger(value)) {
    label = String(value);
  } else {
    label = value.toFixed(1);
  }
  return label.padStart(maxLabelWidth);
}

/**
 * A line graph component that visualizes numeric trends using dots in a 2D grid.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LineGraph data={[1, 3, 2, 5, 4, 6, 3]} height={5} />
 *
 * // With fixed width and color
 * <LineGraph
 *   data={[10, 20, 15, 30, 25]}
 *   width={40}
 *   height={8}
 *   color="cyan"
 *   caption="Sales Trend"
 * />
 *
 * // With Y-axis labels
 * <LineGraph
 *   data={[100, 200, 150, 300]}
 *   height={6}
 *   showYAxis={true}
 * />
 * ```
 */
export const LineGraph = React.memo<LineGraphProps>(function LineGraph(props) {
  const {
    data,
    width = 'auto',
    height = 10,
    yDomain = 'auto',
    dotChar = '.',
    emptyChar = ' ',
    color,
    caption,
    showYAxis = false,
  } = props;

  const autoWidth = useAutoWidth();

  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return null;
  }

  // Filter out non-finite values
  const validData = data.filter(Number.isFinite);
  if (validData.length === 0) {
    return null;
  }

  // Calculate Y domain
  let min: number;
  let max: number;
  if (yDomain === 'auto') {
    min = Math.min(...validData);
    max = Math.max(...validData);
  } else {
    [min, max] = yDomain;
  }

  // Determine effective width
  let effectiveWidth: number;
  if (width === 'auto') {
    effectiveWidth = validData.length;
  } else {
    const calculated = calculateEffectiveWidth(width, autoWidth.width);
    effectiveWidth = typeof calculated === 'number' ? calculated : validData.length;
  }

  // Account for Y-axis width if shown
  const yAxisWidth = showYAxis ? 6 : 0;
  const graphWidth = Math.max(1, effectiveWidth - yAxisWidth);

  // Scale data to fit width
  const scaledData = scaleDataToWidth(validData, graphWidth);

  // Create grid
  const grid = createGrid(graphWidth, height, emptyChar);

  // Place dots on grid
  for (let x = 0; x < scaledData.length; x++) {
    const value = scaledData[x]!;
    const rowIndex = valueToRowIndex(value, min, max, height);
    if (rowIndex >= 0 && rowIndex < height) {
      grid[rowIndex]![x] = dotChar;
    }
  }

  // Convert grid to strings
  const lines: React.ReactElement[] = [];

  // Calculate Y-axis labels
  const yLabels: string[] = [];
  if (showYAxis) {
    const maxLabel = formatAxisLabel(max, 5);
    const minLabel = formatAxisLabel(min, 5);
    const maxLabelWidth = Math.max(maxLabel.length, minLabel.length);

    for (let row = 0; row < height; row++) {
      if (row === 0) {
        yLabels.push(formatAxisLabel(max, maxLabelWidth));
      } else if (row === height - 1) {
        yLabels.push(formatAxisLabel(min, maxLabelWidth));
      } else {
        yLabels.push(' '.repeat(maxLabelWidth));
      }
    }
  }

  for (let row = 0; row < height; row++) {
    const lineContent = grid[row]!.join('');
    const yAxisLabel = showYAxis ? yLabels[row] + '│' : '';

    if (color) {
      lines.push(
        <Text key={row}>
          {yAxisLabel}
          <Text color={color}>{lineContent}</Text>
        </Text>
      );
    } else {
      lines.push(<Text key={row}>{yAxisLabel}{lineContent}</Text>);
    }
  }

  return (
    <Box flexDirection="column">
      {lines}
      {caption && caption.trim() !== '' && <Text>{caption}</Text>}
    </Box>
  );
});
