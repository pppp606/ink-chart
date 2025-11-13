import React from 'react';
import { Text, Box } from 'ink';
import { useAutoWidth } from '../core/useAutoWidth.js';
import { measureWidth, truncateText } from '../measure.js';
import { calculateLayout } from '../barChartLayout.js';
import { calculateEffectiveWidth } from '../core/widthUtils.js';

/**
 * Data point for a bar chart entry
 */
export interface BarChartData {
  /** The label to display for this data point */
  label: string;
  /** The numeric value to represent as a bar */
  value: number;
  /** Optional color for this specific bar (hex code or Ink color name) */
  color?: string;
  /** Optional character for this specific bar */
  char?: string;
}

/**
 * Layout dimensions for fixed-width bar chart rendering
 */
export interface BarChartLayout {
  /** Allocated width for the label section */
  labelWidth: number;
  /** Allocated width for the bar section */
  barWidth: number;
  /** Allocated width for the value section */
  valueWidth: number;
}

/**
 * Available sort orders for bar chart data
 */
export type BarChartSortOrder = 'none' | 'asc' | 'desc';

/**
 * Available value display positions
 */
export type BarChartValueDisplay = 'right' | 'inside' | 'none';

/**
 * Available bar characters for rendering
 */
export type BarChartCharacter = '▆' | '█' | '▓' | '▒' | '░';

/**
 * Sorts bar chart data based on the specified sort order
 */
function sortData(data: BarChartData[], sort: BarChartSortOrder): BarChartData[] {
  const sortedData = [...data];
  if (sort === 'asc') {
    sortedData.sort((a, b) => a.value - b.value);
  } else if (sort === 'desc') {
    sortedData.sort((a, b) => b.value - a.value);
  }
  return sortedData;
}

/**
 * Calculates the maximum value from data or uses provided max
 */
function calculateMaxValue(data: BarChartData[], max: 'auto' | number): number {
  if (data.length === 0) {
    return 0;
  }
  return max === 'auto' ? Math.max(...data.map(d => d.value)) : max;
}


/**
 * Calculates layout for fixed-width rendering
 */
function calculateBarChartLayout(
  data: BarChartData[],
  width: number,
  showValue: BarChartValueDisplay,
  format: (value: number) => string
): BarChartLayout | null {
  if (data.length === 0) {
    return null;
  }

  const maxLabelWidth = Math.max(...data.map(d => measureWidth(d.label)));
  const maxValueWidth = showValue === 'right' ? 
    Math.max(...data.map(d => measureWidth(format(d.value)))) : 0;
  
  const adjustedWidth = width - 1;
  
  return calculateLayout({
    totalWidth: adjustedWidth,
    labelWidth: maxLabelWidth,
    valueWidth: showValue === 'right' ? maxValueWidth + 1 : maxValueWidth,
    minBarWidth: 1
  });
}

/**
 * Renders a single bar row for fixed-width layout
 */
function renderFixedWidthRow(
  item: BarChartData,
  ratio: number,
  layout: BarChartLayout,
  showValue: BarChartValueDisplay,
  format: (value: number) => string,
  barChar: string
): string {
  const { label, value } = item;
  const displayLabel = truncateText(label, layout.labelWidth);
  const barLength = Math.max(1, Math.floor(ratio * layout.barWidth));
  const effectiveChar = item.char || barChar;
  const bar = effectiveChar.repeat(barLength);
  
  if (showValue === 'right') {
    const labelPart = displayLabel.padEnd(layout.labelWidth);
    const barPart = bar.padEnd(layout.barWidth);
    const valuePart = format(value).padStart(layout.valueWidth - 1);
    return labelPart + ' ' + barPart + ' ' + valuePart;
  } else {
    return displayLabel.padEnd(layout.labelWidth) + ' ' + bar;
  }
}

/**
 * Renders a single bar row for auto-width layout
 */
function renderAutoWidthRow(
  item: BarChartData,
  ratio: number,
  showValue: BarChartValueDisplay,
  format: (value: number) => string,
  barChar: string
): string {
  const { label, value } = item;
  const barLength = Math.max(1, Math.floor(ratio * 20));
  const effectiveChar = item.char || barChar;
  const bar = effectiveChar.repeat(barLength);

  if (showValue === 'right') {
    return `${label} ${bar} ${format(value)}`;
  } else {
    return `${label} ${bar}`;
  }
}

/**
 * Props for the BarChart component
 */
export interface BarChartProps {
  /** Array of data points to visualize as bars */
  data: BarChartData[];
  
  /** 
   * Maximum value for scaling bars
   * - 'auto': Uses the maximum value from the data
   * - number: Fixed maximum value for consistent scaling
   */
  max?: 'auto' | number;
  
  /** 
   * Sort order for the data points
   * - 'none': Display in original order
   * - 'asc': Sort by value ascending
   * - 'desc': Sort by value descending
   */
  sort?: BarChartSortOrder;
  
  /** 
   * Where to display the numeric values
   * - 'right': Show values to the right of bars
   * - 'inside': Show values inside the bars (future use)
   * - 'none': Don't show values
   */
  showValue?: BarChartValueDisplay;
  
  /** 
   * Custom formatter for numeric values
   * @param value - The numeric value to format
   * @returns Formatted string representation
   */
  format?: (value: number) => string;
  
  /** 
   * Character to use for drawing bars
   * - '▆': Lower block (default, with visual spacing)
   * - '█': Full block (solid appearance)
   * - '▓': Dark shade
   * - '▒': Medium shade
   * - '░': Light shade
   */
  barChar?: BarChartCharacter;
  
  /** 
   * Padding around the chart (future use, currently unused)
   */
  padding?: 0 | 1 | 2;
  
  /** 
   * Total width constraint for the chart
   * - 'auto': Use natural width based on content
   * - 'full': Use full terminal width
   * - number: Fixed width, content will be adjusted to fit
   */
  width?: 'auto' | 'full' | number;
  
  /**
   * Color for the bars (hex code like "#ff0000" or Ink color names)
   */
  color?: string;
}



/**
 * A horizontal bar chart component for terminal applications.
 * 
 * Renders data as horizontal bars with customizable appearance, sorting,
 * and value display options. Supports both auto-scaling and fixed-width layouts
 * with intelligent space allocation between labels, bars, and values.
 * 
 * Component is optimized with React.memo to minimize re-renders, only updating
 * the specific bar rows that have changed values.
 * 
 * @example
 * ```tsx
 * // Basic usage with auto-scaling
 * <BarChart data={[{ label: 'A', value: 10 }, { label: 'B', value: 20 }]} />
 * 
 * // Sorted with values shown and custom formatting
 * <BarChart 
 *   data={[{ label: 'Sales', value: 1250 }, { label: 'Marketing', value: 800 }]}
 *   sort="desc"
 *   showValue="right"
 *   format={(v) => `$${v}`}
 *   width={50}
 * />
 * 
 * // Custom bar character and fixed maximum
 * <BarChart 
 *   data={[{ label: 'Progress', value: 75 }]}
 *   max={100}
 *   barChar="▓"
 *   showValue="right"
 *   format={(v) => `${v}%`}
 * />
 * ```
 * 
 * @param props - Component properties
 * @returns React element containing the rendered bar chart, or null for empty/invalid data
 */
export const BarChart = React.memo<BarChartProps>(function BarChart(props: BarChartProps): React.ReactElement | null {
  const {
    data,
    max = 'auto',
    sort = 'none',
    showValue = 'none',
    format = (value: number) => value.toString(),
    barChar = '▆',
    width = 'auto',
    color
  } = props;

  // Use auto-width hook for terminal width detection (must be before any early returns)
  const autoWidth = useAutoWidth();
  const effectiveWidth = calculateEffectiveWidth(width, autoWidth.width);

  // Handle empty data
  if (!data || data.length === 0) {
    return null;
  }

  // Sort data
  const sortedData = sortData(data, sort);
  
  // Calculate maximum value
  const maxValue = calculateMaxValue(sortedData, max);
  
  // Cannot render meaningful bars with non-positive maximum
  if (maxValue <= 0) {
    return null;
  }
  
  // Calculate layout for fixed-width rendering
  const layout = typeof effectiveWidth === 'number' 
    ? calculateBarChartLayout(sortedData, effectiveWidth, showValue, format)
    : null;

  // Render each data point as a bar row
  const rows = sortedData.map((item, index) => {
    const ratio = item.value / maxValue;
    const effectiveColor = item.color || color;
    
    const rowContent = layout
      ? renderFixedWidthRow(item, ratio, layout, showValue, format, barChar)
      : renderAutoWidthRow(item, ratio, showValue, format, barChar);
    
    return effectiveColor ? (
      <Text key={`${item.label}-${index}`} color={effectiveColor}>
        {rowContent}
      </Text>
    ) : (
      <Text key={`${item.label}-${index}`}>
        {rowContent}
      </Text>
    );
  });

  return (
    <Box flexDirection="column">
      {rows}
    </Box>
  );
});