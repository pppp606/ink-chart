import React from 'react';
import { Text, Box } from 'ink';
import { useAutoWidth } from '../core/useAutoWidth.js';
import { measureWidth } from '../measure.js';
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
 */
const DEFAULT_CHARS: StackedBarCharacter[] = ['█', '▓', '▒', '░'];

/**
 * Props for the StackedBarChart component
 */
export interface StackedBarChartProps {
  /** Array of segments to display in the stacked bar */
  data: StackedBarSegment[];

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
   * Whether to show percentage values below the bar
   * @default true
   */
  showValues?: boolean;

  /**
   * Custom formatter for percentage values
   * @param value - The percentage value (0-100)
   * @returns Formatted string representation
   */
  format?: (value: number) => string;
}

/**
 * Segment with calculated position and dimensions
 */
interface PositionedSegment {
  segment: StackedBarSegment;
  percentage: number;
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
  barWidth: number
): PositionedSegment[] {
  const total = calculateTotal(data);
  if (total <= 0) {
    return [];
  }

  const positions: PositionedSegment[] = [];
  let currentPos = 0;

  for (let i = 0; i < data.length; i++) {
    const segment = data[i];
    if (!segment) {
      continue;
    }
    const percentage = (segment.value / total) * 100;
    const length = Math.max(1, Math.round((percentage / 100) * barWidth));
    const char = segment.char || DEFAULT_CHARS[i % DEFAULT_CHARS.length] || '█';

    positions.push({
      segment,
      percentage,
      startPos: currentPos,
      length,
      char
    });

    currentPos += length;
  }

  // Adjust last segment to fill exactly to barWidth
  if (positions.length > 0 && currentPos !== barWidth) {
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
  format: (value: number) => string
): string {
  const line = new Array(barWidth).fill(' ');

  for (const pos of positions) {
    const valueText = format(pos.percentage);
    const startPos = pos.startPos;

    // Place value at segment start position
    for (let i = 0; i < valueText.length && startPos + i < barWidth; i++) {
      line[startPos + i] = valueText[i];
    }
  }

  return line.join('');
}

/**
 * A horizontal stacked bar chart component showing percentage distribution.
 *
 * Displays data as a single bar divided into colored segments, with each segment
 * representing a percentage of the total. Labels and values are aligned to each
 * segment's starting position for clear visual association.
 *
 * @example
 * ```tsx
 * // Basic usage with automatic percentage calculation
 * <StackedBarChart
 *   data={[
 *     { label: 'Sales', value: 30, color: '#4aaa1a' },
 *     { label: 'Warning', value: 20, color: '#d89612' },
 *     { label: 'Error', value: 50, color: '#a61d24' }
 *   ]}
 * />
 *
 * // Without labels, custom formatting
 * <StackedBarChart
 *   data={[
 *     { label: 'Complete', value: 75 },
 *     { label: 'Remaining', value: 25 }
 *   ]}
 *   showLabels={false}
 *   format={(v) => `${v.toFixed(1)}%`}
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
      width = 'auto',
      showLabels = true,
      showValues = true,
      format = (value: number) => `${value.toFixed(1)}%`
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
    const positions = calculateSegmentPositions(data, barWidth);
    if (positions.length === 0) {
      return null;
    }

    // Render label line
    const labelLine = showLabels ? renderLabelLine(positions, barWidth) : null;

    // Render value line
    const valueLine = showValues ? renderValueLine(positions, barWidth, format) : null;

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
