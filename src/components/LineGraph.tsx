import React from 'react';
import { Text, Box } from 'ink';
import { useAutoWidth } from '../core/useAutoWidth.js';
import { calculateEffectiveWidth } from '../core/widthUtils.js';

/**
 * Characters for line rendering (top, middle, bottom positions within a row)
 */
const LINE_CHARS: [string, string, string] = ['‾', '─', '_'];

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
   * Height of the graph in rows (lines).
   * Each row provides 3 levels of resolution (top/middle/bottom).
   * So height=5 gives 15 vertical levels of resolution.
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
   * Color for the graph (ink color name)
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
 * Creates a 2D grid filled with spaces
 */
function createGrid(width: number, height: number): string[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ' ')
  );
}

/**
 * Converts a value to a position index (0 to totalLevels-1)
 * where 0 is bottom and totalLevels-1 is top
 */
function valueToPosition(
  value: number,
  min: number,
  max: number,
  totalLevels: number
): number {
  if (max === min) {
    return Math.floor(totalLevels / 2);
  }
  const normalized = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));
  // Map to [0, totalLevels-1]
  return Math.round(clamped * (totalLevels - 1));
}

/**
 * Converts a position (0 = bottom, totalLevels-1 = top) to row and sub-position
 * @returns [rowIndex, subPosition] where subPosition is 0=bottom, 1=middle, 2=top within row
 */
function positionToRowAndSub(
  position: number,
  height: number
): [number, number] {
  // position 0 is bottom-most, position (height*3-1) is top-most
  // Row 0 is top of display, row (height-1) is bottom
  const levelsPerRow = 3;
  const totalLevels = height * levelsPerRow;

  // Invert: position 0 -> row (height-1), subPos 0
  //         position (totalLevels-1) -> row 0, subPos 2
  const invertedPosition = totalLevels - 1 - position;
  const rowIndex = Math.floor(invertedPosition / levelsPerRow);
  const subPosition = levelsPerRow - 1 - (invertedPosition % levelsPerRow);

  return [rowIndex, subPosition];
}

/**
 * Scales data to match target width using linear interpolation
 */
function scaleDataToWidth(data: number[], targetWidth: number): number[] {
  if (data.length === targetWidth) {
    return data;
  }

  if (data.length === 1) {
    return Array(targetWidth).fill(data[0]);
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
 * A high-resolution line graph component that visualizes numeric trends.
 *
 * Uses Unicode line characters (‾ ─ _) at different vertical positions
 * within each row to achieve 3x the vertical resolution.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LineGraph data={[1, 3, 2, 5, 4, 6, 3]} height={5} />
 *
 * // With color and caption
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
  const grid = createGrid(graphWidth, height);

  // Get line characters
  const totalLevels = height * 3;

  // Place characters on grid
  for (let x = 0; x < scaledData.length; x++) {
    const value = scaledData[x]!;
    const position = valueToPosition(value, min, max, totalLevels);
    const [rowIndex, subPosition] = positionToRowAndSub(position, height);

    if (rowIndex >= 0 && rowIndex < height) {
      // subPosition: 0=bottom, 1=middle, 2=top -> LINE_CHARS[2-subPosition]
      grid[rowIndex]![x] = LINE_CHARS[2 - subPosition]!;
    }
  }

  // Convert grid to React elements
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
