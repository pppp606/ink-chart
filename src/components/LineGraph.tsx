import React from 'react';
import { Text, Box } from 'ink';
import { useAutoWidth } from '../core/useAutoWidth.js';
import { calculateEffectiveWidth } from '../core/widthUtils.js';

/**
 * Characters for line rendering (5 vertical positions within a row)
 * Using Unicode horizontal scan line characters for consistent width
 * Position 0 = top (⎺), Position 4 = bottom (⎽)
 */
const LINE_CHARS: [string, string, string, string, string] = [
  '⎺', // U+23BA HORIZONTAL SCAN LINE-1 (top)
  '⎻', // U+23BB HORIZONTAL SCAN LINE-3
  '─', // U+2500 BOX DRAWINGS LIGHT HORIZONTAL (middle)
  '⎼', // U+23BC HORIZONTAL SCAN LINE-7
  '⎽', // U+23BD HORIZONTAL SCAN LINE-9 (bottom)
];

/**
 * A single data series with values and optional color
 */
export interface LineGraphSeries {
  /**
   * Array of numeric values for this series
   */
  values: number[];

  /**
   * Color for this series (ink color name or hex)
   */
  color?: string;
}

/**
 * Props for the LineGraph component
 */
export interface LineGraphProps {
  /**
   * Array of data series to visualize.
   * Each series has values and an optional color.
   * When lines overlap, earlier series take priority.
   */
  data: LineGraphSeries[];

  /**
   * Width of the graph in characters.
   * - 'auto': Uses the length of the longest data array
   * - 'full': Uses full terminal width with margin
   * - number: Fixed width, data will be sampled/interpolated to fit
   */
  width?: 'auto' | 'full' | number;

  /**
   * Height of the graph in rows (lines).
   * Each row provides 5 levels of resolution using scan line characters.
   * So height=5 gives 25 vertical levels of resolution.
   * @default 10
   */
  height?: number;

  /**
   * Y-axis domain for value mapping
   * - 'auto': Automatically scales to min/max of all data
   * - [min, max]: Fixed domain range for consistent scaling
   */
  yDomain?: 'auto' | [number, number];

  /**
   * Optional caption to display below the graph
   */
  caption?: string;

  /**
   * Whether to show Y-axis labels (shows min/max by default)
   * @default false
   */
  showYAxis?: boolean;

  /**
   * Y-axis labels
   * - Numbers: positioned at their actual Y values (e.g., [0, 50, 100])
   * - Strings: distributed evenly across the axis
   * When specified, showYAxis is automatically enabled
   */
  yLabels?: (string | number)[];

  /**
   * X-axis labels
   * - Strings: distributed evenly across the axis (e.g., ['Q1', 'Q2', 'Q3', 'Q4'])
   * - Numbers: positioned at their actual data positions (e.g., [0, 25, 50, 75, 100])
   */
  xLabels?: (string | number)[];
}

/**
 * Grid cell containing character and color
 */
interface GridCell {
  char: string;
  color: string | undefined;
}

/**
 * Creates a 2D grid filled with empty cells
 */
function createGrid(width: number, height: number): GridCell[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: ' ', color: undefined }))
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
  return Math.round(clamped * (totalLevels - 1));
}

/**
 * Converts a position (0 = bottom, totalLevels-1 = top) to row and sub-position
 * @returns [rowIndex, subPosition] where subPosition is 0=top, 4=bottom within row
 */
function positionToRowAndSub(
  position: number,
  height: number
): [number, number] {
  const levelsPerRow = 5;
  const totalLevels = height * levelsPerRow;
  const invertedPosition = totalLevels - 1 - position;
  const rowIndex = Math.floor(invertedPosition / levelsPerRow);
  const subPosition = invertedPosition % levelsPerRow;
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
 * Renders a row with colored segments
 */
function renderColoredRow(cells: GridCell[]): React.ReactElement[] {
  const segments: React.ReactElement[] = [];
  let currentColor: string | undefined;
  let currentText = '';
  let segmentIndex = 0;

  for (const cell of cells) {
    if (cell.color !== currentColor) {
      if (currentText) {
        if (currentColor) {
          segments.push(<Text key={segmentIndex++} color={currentColor}>{currentText}</Text>);
        } else {
          segments.push(<Text key={segmentIndex++}>{currentText}</Text>);
        }
      }
      currentColor = cell.color;
      currentText = cell.char;
    } else {
      currentText += cell.char;
    }
  }

  // Push the last segment
  if (currentText) {
    if (currentColor) {
      segments.push(<Text key={segmentIndex++} color={currentColor}>{currentText}</Text>);
    } else {
      segments.push(<Text key={segmentIndex++}>{currentText}</Text>);
    }
  }

  return segments;
}

/**
 * A high-resolution line graph component that visualizes multiple data series.
 *
 * Uses Unicode horizontal scan line characters (⎺ ⎻ ─ ⎼ ⎽) at different vertical positions
 * within each row to achieve 5x the vertical resolution.
 *
 * @example
 * ```tsx
 * // Single series
 * <LineGraph data={[{ values: [1, 3, 2, 5, 4], color: 'cyan' }]} height={5} />
 *
 * // Multiple series with different colors
 * <LineGraph
 *   data={[
 *     { values: [10, 20, 15, 30, 25], color: 'red' },
 *     { values: [5, 15, 20, 10, 30], color: 'blue' },
 *   ]}
 *   width={40}
 *   height={8}
 *   caption="Comparison"
 * />
 *
 * // With Y-axis labels
 * <LineGraph
 *   data={[{ values: [100, 200, 150, 300] }]}
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
    caption,
    showYAxis = false,
    yLabels: yLabelsProp,
    xLabels,
  } = props;

  // Enable Y-axis if yLabels is provided
  const hasYAxis = showYAxis || (yLabelsProp && yLabelsProp.length > 0);

  const autoWidth = useAutoWidth();

  // Handle empty data
  if (!data || data.length === 0) {
    return null;
  }

  // Collect all valid values from all series
  const allValidValues: number[] = [];
  const validSeries: Array<{ values: number[]; color: string | undefined }> = [];

  for (const series of data) {
    const validValues = series.values.filter(Number.isFinite);
    if (validValues.length > 0) {
      validSeries.push({ values: validValues, color: series.color });
      allValidValues.push(...validValues);
    }
  }

  if (validSeries.length === 0 || allValidValues.length === 0) {
    return null;
  }

  // Calculate Y domain from all data
  let min: number;
  let max: number;
  if (yDomain === 'auto') {
    min = Math.min(...allValidValues);
    max = Math.max(...allValidValues);
  } else {
    [min, max] = yDomain;
  }

  // Calculate Y-axis label width based on actual values or provided labels
  let yAxisLabelWidth = 0;
  if (hasYAxis) {
    if (yLabelsProp && yLabelsProp.length > 0) {
      // Use provided labels to calculate width
      for (const label of yLabelsProp) {
        const labelStr = typeof label === 'number' ? formatAxisLabel(label, 1) : String(label);
        yAxisLabelWidth = Math.max(yAxisLabelWidth, labelStr.length);
      }
    } else {
      // Use min/max for default labels
      const maxLabel = formatAxisLabel(max, 1);
      const minLabel = formatAxisLabel(min, 1);
      yAxisLabelWidth = Math.max(maxLabel.length, minLabel.length);
    }
  }
  const yAxisWidth = hasYAxis ? yAxisLabelWidth + 1 : 0; // +1 for │

  // Determine effective width (use longest series for 'auto')
  let effectiveWidth: number;
  if (width === 'auto') {
    effectiveWidth = Math.max(...validSeries.map(s => s.values.length));
  } else {
    const calculated = calculateEffectiveWidth(width, autoWidth.width);
    effectiveWidth = typeof calculated === 'number'
      ? calculated
      : Math.max(...validSeries.map(s => s.values.length));
  }

  const graphWidth = Math.max(1, effectiveWidth - yAxisWidth);

  // Create grid with cells that track character and color
  const grid = createGrid(graphWidth, height);
  const totalLevels = height * 5;

  // Place characters on grid for each series (first series has priority)
  for (const series of validSeries) {
    const scaledData = scaleDataToWidth(series.values, graphWidth);

    for (let x = 0; x < scaledData.length; x++) {
      const value = scaledData[x]!;
      const position = valueToPosition(value, min, max, totalLevels);
      const [rowIndex, subPosition] = positionToRowAndSub(position, height);

      if (rowIndex >= 0 && rowIndex < height) {
        const cell = grid[rowIndex]![x]!;
        // Only place if cell is empty (first series wins)
        if (cell.char === ' ') {
          cell.char = LINE_CHARS[subPosition]!;
          cell.color = series.color;
        }
      }
    }
  }

  // Convert grid to React elements
  const lines: React.ReactElement[] = [];

  // Calculate Y-axis labels
  const yLabels: string[] = [];
  if (hasYAxis) {
    // Initialize all rows with empty labels
    for (let row = 0; row < height; row++) {
      yLabels.push(' '.repeat(yAxisLabelWidth));
    }

    if (yLabelsProp && yLabelsProp.length > 0) {
      // Check if all labels are numbers
      const allNumbers = yLabelsProp.every(l => typeof l === 'number');

      if (allNumbers) {
        // Position-based placement for numbers
        for (const label of yLabelsProp) {
          const value = label as number;
          // Skip labels outside yDomain range
          if (value < min || value > max) {
            continue;
          }
          // Calculate which row this value corresponds to
          const normalizedPos = max === min ? 0.5 : (value - min) / (max - min);
          const row = Math.round((1 - normalizedPos) * (height - 1));
          if (row >= 0 && row < height) {
            yLabels[row] = formatAxisLabel(value, yAxisLabelWidth);
          }
        }
      } else {
        // Even distribution for strings
        for (let i = 0; i < yLabelsProp.length; i++) {
          const row = yLabelsProp.length === 1
            ? 0
            : Math.round((i / (yLabelsProp.length - 1)) * (height - 1));
          if (row >= 0 && row < height) {
            const labelStr = String(yLabelsProp[i]);
            yLabels[row] = labelStr.padStart(yAxisLabelWidth);
          }
        }
      }
    } else {
      // Default: show min/max only
      yLabels[0] = formatAxisLabel(max, yAxisLabelWidth);
      yLabels[height - 1] = formatAxisLabel(min, yAxisLabelWidth);
    }
  }

  for (let row = 0; row < height; row++) {
    const coloredSegments = renderColoredRow(grid[row]!);

    lines.push(
      <Text key={row}>
        {hasYAxis && <Text dimColor>{yLabels[row]}│</Text>}
        {coloredSegments}
      </Text>
    );
  }

  // Render X-axis line and labels
  const xAxisElements: React.ReactElement[] = [];
  if (xLabels && xLabels.length > 0) {
    const yAxisPadding = hasYAxis ? ' '.repeat(yAxisWidth - 1) + '└' : '';
    const axisLine = '─'.repeat(graphWidth);

    // X-axis line
    xAxisElements.push(
      <Text key="xaxis-line" dimColor>
        {yAxisPadding}{axisLine}
      </Text>
    );

    // Build label line with proper positioning
    const labelLine = Array(graphWidth).fill(' ');
    const labelCount = xLabels.length;

    // Check if all labels are numbers (for position-based placement)
    const allNumbers = xLabels.every(l => typeof l === 'number');

    if (allNumbers && labelCount > 1) {
      // Position-based placement for numbers
      const numLabels = xLabels as number[];
      const minLabel = Math.min(...numLabels);
      const maxLabel = Math.max(...numLabels);
      const range = maxLabel - minLabel;

      for (const label of numLabels) {
        const labelStr = String(label);
        const normalizedPos = range > 0 ? (label - minLabel) / range : 0;
        const pos = Math.round(normalizedPos * (graphWidth - 1));
        const startPos = Math.max(0, Math.min(graphWidth - labelStr.length, pos - Math.floor(labelStr.length / 2)));
        for (let i = 0; i < labelStr.length && startPos + i < graphWidth; i++) {
          labelLine[startPos + i] = labelStr[i]!;
        }
      }
    } else {
      // Even distribution for strings (or single label)
      for (let i = 0; i < labelCount; i++) {
        const labelStr = String(xLabels[i]);
        const pos = labelCount === 1
          ? 0
          : Math.round((i / (labelCount - 1)) * (graphWidth - 1));
        const startPos = Math.max(0, Math.min(graphWidth - labelStr.length, pos - Math.floor(labelStr.length / 2)));
        for (let j = 0; j < labelStr.length && startPos + j < graphWidth; j++) {
          labelLine[startPos + j] = labelStr[j]!;
        }
      }
    }

    const labelPadding = hasYAxis ? ' '.repeat(yAxisWidth) : '';
    xAxisElements.push(
      <Text key="xaxis-labels" dimColor>
        {labelPadding}{labelLine.join('')}
      </Text>
    );
  }

  return (
    <Box flexDirection="column">
      {lines}
      {xAxisElements}
      {caption && caption.trim() !== '' && <Text>{caption}</Text>}
    </Box>
  );
});
