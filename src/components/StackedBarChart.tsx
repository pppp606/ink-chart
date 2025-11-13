import React from 'react';
import { Text, Box } from 'ink';
import { useAutoWidth } from '../core/useAutoWidth.js';
import { calculateEffectiveWidth } from '../core/widthUtils.js';

/**
 * Data point for a stacked bar chart segment
 */
export interface StackedBarSegment {
  /** The label to display for this segment */
  label: string;
  /** The numeric value for this segment */
  value: number;
  /** Optional color for this specific segment (hex code or Ink color name) */
  color?: string;
  /** Optional character to use for this segment (default varies by index) */
  char?: string;
}

/**
 * Available bar characters for rendering segments
 */
export type StackedBarCharacter = '█' | '▓' | '▒' | '░' | '▆' | '▪' | '■';

/**
 * Default characters for segments (cycles through these)
 * All use Full Block (U+2588) for consistent appearance - differentiate by color
 */
const DEFAULT_CHARS: StackedBarCharacter[] = ['█', '█', '█', '█'];

/**
 * Stacked bar chart display mode
 */
export type StackedBarChartMode = 'percentage' | 'absolute';

/**
 * Props for the StackedBarChart component
 */
export interface StackedBarChartProps {
  /** Array of segments to display in the stacked bar */
  data: StackedBarSegment[];

  /**
   * Display mode for the chart
   * - 'percentage': 100% stacked bar showing percentage distribution (default)
   * - 'absolute': Stacked bar showing absolute values scaled to max
   * @default 'percentage'
   */
  mode?: StackedBarChartMode;

  /**
   * Maximum value for scaling (only used in 'absolute' mode)
   * - 'auto': Uses the sum of all segment values
   * - number: Fixed maximum value for consistent scaling
   * @default 'auto'
   */
  max?: 'auto' | number;

  /**
   * Total width constraint for the chart
   * - 'auto': Use 40 characters as default width
   * - 'full': Use full terminal width
   * - number: Fixed width for the bar
   */
  width?: 'auto' | 'full' | number;

  /**
   * Whether to show segment labels above the bar
   * @default true
   */
  showLabels?: boolean;

  /**
   * Whether to show values below the bar
   * @default true
   */
  showValues?: boolean;

  /**
   * Custom formatter for values
   * @param value - The value to format (percentage in percentage mode, absolute value in absolute mode)
   * @param mode - The current display mode
   * @returns Formatted string representation
   */
  format?: (value: number, mode: StackedBarChartMode) => string;
}

/**
 * Segment with calculated position and dimensions
 */
interface PositionedSegment {
  segment: StackedBarSegment;
  displayValue: number; // The value to display (percentage or absolute)
  startPos: number;
  length: number;
  char: string;
}

/**
 * Calculate total value from all segments
 */
function calculateTotal(data: StackedBarSegment[]): number {
  return data.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
}

/**
 * Calculate positions and dimensions for all segments
 */
function calculateSegmentPositions(
  data: StackedBarSegment[],
  barWidth: number,
  mode: StackedBarChartMode,
  max: 'auto' | number
): PositionedSegment[] {
  const total = calculateTotal(data);
  if (total <= 0) {
    return [];
  }

  const positions: PositionedSegment[] = [];
  let currentPos = 0;

  // In percentage mode, always use total as max
  // In absolute mode, use max parameter or total
  const maxValue = mode === 'percentage' ? total : (max === 'auto' ? total : max);

  for (let i = 0; i < data.length; i++) {
    const segment = data[i];
    if (!segment) {
      continue;
    }

    // Calculate display value and bar length based on mode
    let displayValue: number;
    let barRatio: number;

    if (mode === 'percentage') {
      displayValue = (segment.value / total) * 100;
      barRatio = segment.value / total;
    } else {
      // absolute mode
      displayValue = segment.value;
      barRatio = segment.value / maxValue;
    }

    const length = Math.max(1, Math.round(barRatio * barWidth));
    const char = segment.char || DEFAULT_CHARS[i % DEFAULT_CHARS.length] || '█';

    positions.push({
      segment,
      displayValue,
      startPos: currentPos,
      length,
      char
    });

    currentPos += length;
  }

  // Adjust last segment to fill exactly to barWidth (only in percentage mode)
  if (mode === 'percentage' && positions.length > 0 && currentPos !== barWidth) {
    const lastSegment = positions[positions.length - 1];
    if (lastSegment) {
      lastSegment.length += barWidth - currentPos;
    }
  }

  return positions;
}

/**
 * Render label text positioned at segment start
 */
function renderLabelLine(positions: PositionedSegment[], barWidth: number): string {
  const line = new Array(barWidth).fill(' ');

  for (const pos of positions) {
    const label = pos.segment.label;
    const startPos = pos.startPos;

    // Place label at segment start position
    for (let i = 0; i < label.length && startPos + i < barWidth; i++) {
      line[startPos + i] = label[i];
    }
  }

  return line.join('');
}

/**
 * Render value text positioned at segment start
 */
function renderValueLine(
  positions: PositionedSegment[],
  barWidth: number,
  format: (value: number, mode: StackedBarChartMode) => string,
  mode: StackedBarChartMode
): string {
  const line = new Array(barWidth).fill(' ');

  for (const pos of positions) {
    const valueText = format(pos.displayValue, mode);
    const startPos = pos.startPos;

    // Place value at segment start position
    for (let i = 0; i < valueText.length && startPos + i < barWidth; i++) {
      line[startPos + i] = valueText[i];
    }
  }

  return line.join('');
}

/**
 * A horizontal stacked bar chart component showing percentage distribution or absolute values.
 *
 * Displays data as a single bar divided into colored segments. In percentage mode,
 * each segment represents a percentage of the total. In absolute mode, segments show
 * actual values scaled to a maximum. Labels and values are aligned to each
 * segment's starting position for clear visual association.
 *
 * @example
 * ```tsx
 * // Percentage mode (default) - 100% stacked
 * <StackedBarChart
 *   data={[
 *     { label: 'Sales', value: 30, color: '#4aaa1a' },
 *     { label: 'Warning', value: 20, color: '#d89612' },
 *     { label: 'Error', value: 50, color: '#a61d24' }
 *   ]}
 * />
 *
 * // Absolute mode - showing actual values
 * <StackedBarChart
 *   data={[
 *     { label: 'Complete', value: 75 },
 *     { label: 'In Progress', value: 25 }
 *   ]}
 *   mode="absolute"
 *   max={200}
 *   format={(v, mode) => mode === 'percentage' ? `${v.toFixed(1)}%` : `${v}`}
 *   width={60}
 * />
 * ```
 *
 * @param props - Component properties
 * @returns React element containing the rendered stacked bar chart, or null for empty/invalid data
 */
export const StackedBarChart = React.memo<StackedBarChartProps>(
  function StackedBarChart(props: StackedBarChartProps): React.ReactElement | null {
    const {
      data,
      mode = 'percentage',
      max = 'auto',
      width = 'auto',
      showLabels = true,
      showValues = true,
      format = (value: number, displayMode: StackedBarChartMode) =>
        displayMode === 'percentage' ? `${value.toFixed(1)}%` : `${value.toFixed(0)}`
    } = props;

    // Use auto-width hook for terminal width detection
    const autoWidth = useAutoWidth();
    const effectiveWidth = calculateEffectiveWidth(width, autoWidth.width);

    // Handle empty or invalid data
    if (!data || data.length === 0) {
      return null;
    }

    // Calculate total and validate
    const total = calculateTotal(data);
    if (total <= 0) {
      return null;
    }

    // Determine bar width
    const barWidth = typeof effectiveWidth === 'number' ? effectiveWidth : 40;

    // Calculate segment positions
    const positions = calculateSegmentPositions(data, barWidth, mode, max);
    if (positions.length === 0) {
      return null;
    }

    // Render label line
    const labelLine = showLabels ? renderLabelLine(positions, barWidth) : null;

    // Render value line
    const valueLine = showValues ? renderValueLine(positions, barWidth, format, mode) : null;

    // Render bar segments
    const barElements = positions.map((pos, index) => {
      const segmentBar = pos.char.repeat(pos.length);
      return pos.segment.color ? (
        <Text key={`segment-${index}`} color={pos.segment.color}>
          {segmentBar}
        </Text>
      ) : (
        <Text key={`segment-${index}`}>{segmentBar}</Text>
      );
    });

    return (
      <Box flexDirection="column">
        {showLabels && labelLine && <Text>{labelLine}</Text>}
        <Box>{barElements}</Box>
        {showValues && valueLine && <Text>{valueLine}</Text>}
      </Box>
    );
  }
);
