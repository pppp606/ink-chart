import React, { useMemo } from 'react';
import { Text, Box } from 'ink';
import { measureWidth, truncateText } from '../measure.js';
import { calculateLayout } from '../barchart.layout.js';
import { useAutoWidth } from '../core/useAutoWidth.js';

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
   * - number: Fixed width, content will be adjusted to fit
   */
  width?: 'auto' | number;
  
  /**
   * Color for the bars (hex code like "#ff0000" or Ink color names)
   */
  color?: string;
}

/**
 * Sorts bar chart data based on the specified sort order
 * @param data - Array of data points to sort
 * @param sort - Sort order configuration
 * @returns New sorted array (original array is not modified)
 */
function sortData(data: BarChartData[], sort: BarChartSortOrder): BarChartData[] {
  const sortedData = [...data];
  if (sort === 'asc') {
    sortedData.sort((a, b) => a.value - b.value);
  } else if (sort === 'desc') {
    sortedData.sort((a, b) => b.value - a.value);
  }
  // 'none' requires no action - use original order
  return sortedData;
}

/**
 * Renders a single bar row for fixed-width layout
 * @param item - Data point to render
 * @param ratio - Normalized value ratio (0-1)
 * @param layout - Calculated layout dimensions
 * @param showValue - Value display configuration
 * @param format - Value formatting function
 * @param barChar - Character to use for bars
 * @returns Formatted string for this bar row
 */
function renderFixedWidthRow(
  item: BarChartData,
  ratio: number,
  layout: BarChartLayout,
  showValue: BarChartValueDisplay,
  format: (value: number) => string,
  barChar: string,
  _color?: string
): string {
  const { label, value } = item;
  const displayLabel = truncateText(label, layout.labelWidth);
  const barLength = Math.max(1, Math.floor(ratio * layout.barWidth));
  const bar = barChar.repeat(barLength);
  

  if (showValue === 'right') {
    const labelPart = displayLabel.padEnd(layout.labelWidth);
    const barPart = bar.padEnd(layout.barWidth); // Ensure consistent width for bar area
    const valuePart = format(value).padStart(layout.valueWidth - 1); // -1 for space separator
    return labelPart + ' ' + barPart + ' ' + valuePart;  // Added space between label-bar and bar-value
  } else {
    return displayLabel.padEnd(layout.labelWidth) + ' ' + bar;  // Added space between label and bar
  }
}

/**
 * Renders a single bar row for auto-width layout
 * @param item - Data point to render
 * @param ratio - Normalized value ratio (0-1)
 * @param showValue - Value display configuration
 * @param format - Value formatting function
 * @param barChar - Character to use for bars
 * @returns Formatted string for this bar row
 */
function renderAutoWidthRow(
  item: BarChartData,
  ratio: number,
  showValue: BarChartValueDisplay,
  format: (value: number) => string,
  barChar: string,
  _color?: string
): string {
  const { label, value } = item;
  const barLength = Math.max(1, Math.floor(ratio * 20)); // Default bar length for auto width
  const bar = barChar.repeat(barLength);

  if (showValue === 'right') {
    return `${label} ${bar} ${format(value)}`;
  } else {
    return `${label} ${bar}`;
  }
}

/**
 * Memoized bar row component to prevent unnecessary re-renders
 */
const BarRow = React.memo<{
  item: BarChartData;
  ratio: number;
  layout: BarChartLayout | null;
  showValue: BarChartValueDisplay;
  format: (value: number) => string;
  barChar: string;
  color?: string;
}>(({ item, ratio, layout, showValue, format, barChar, color }) => {
  const effectiveColor = item.color || color;
  
  const rowContent = useMemo(() => {
    if (layout) {
      return renderFixedWidthRow(item, ratio, layout, showValue, format, barChar, effectiveColor);
    } else {
      return renderAutoWidthRow(item, ratio, showValue, format, barChar, effectiveColor);
    }
  }, [item, ratio, layout, showValue, format, barChar, effectiveColor]);
  
  return effectiveColor ? (
    <Text color={effectiveColor}>{rowContent}</Text>
  ) : (
    <Text>{rowContent}</Text>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to only re-render when values actually change
  return (
    prevProps.item.value === nextProps.item.value &&
    prevProps.item.label === nextProps.item.label &&
    prevProps.item.color === nextProps.item.color &&
    prevProps.ratio === nextProps.ratio &&
    prevProps.showValue === nextProps.showValue &&
    prevProps.barChar === nextProps.barChar &&
    prevProps.color === nextProps.color
  );
});

BarRow.displayName = 'BarRow';

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

  // Use auto-width hook when width is set to 'auto'
  const autoWidth = useAutoWidth();
  const effectiveWidth = width === 'auto' ? autoWidth.width : width;

  // Memoize sorted data to prevent unnecessary recalculations
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return sortData(data, sort);
  }, [data, sort]);

  // Memoize maximum value calculation
  const maxValue = useMemo(() => {
    if (sortedData.length === 0) {
      return 0;
    }
    return max === 'auto' ? Math.max(...sortedData.map(d => d.value)) : max;
  }, [max, sortedData]);

  // Memoize layout calculation for fixed-width rendering
  const layout = useMemo(() => {
    if (typeof effectiveWidth === 'number' && sortedData.length > 0) {
      const maxLabelWidth = Math.max(...sortedData.map(d => measureWidth(d.label)));
      const maxValueWidth = showValue === 'right' ? 
        Math.max(...sortedData.map(d => measureWidth(format(d.value)))) : 0;
      
      // Account for space between label and bar (1 char)
      const adjustedWidth = effectiveWidth - 1;
      
      return calculateLayout({
        totalWidth: adjustedWidth,
        labelWidth: maxLabelWidth,
        valueWidth: showValue === 'right' ? maxValueWidth + 1 : maxValueWidth, // +1 for space separator
        minBarWidth: 1
      });
    }
    return null;
  }, [effectiveWidth, sortedData, showValue, format]);

  // Render each data point as a memoized bar row
  const rows = useMemo(() => {
    if (sortedData.length === 0 || maxValue <= 0) {
      return [];
    }
    
    return sortedData.map((item, index) => {
      const ratio = item.value / maxValue;
      
      return (
        <BarRow
          key={`${item.label}-${index}`}
          item={item}
          ratio={ratio}
          layout={layout}
          showValue={showValue}
          format={format}
          barChar={barChar}
          {...(color ? { color } : {})}
        />
      );
    });
  }, [sortedData, maxValue, layout, showValue, format, barChar, color]);

  // Handle empty or invalid data after hooks
  if (!data || data.length === 0) {
    return null;
  }
  
  // Cannot render meaningful bars with non-positive maximum
  if (maxValue <= 0) {
    return null;
  }

  return (
    <Box flexDirection="column">
      {rows}
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for BarChart memo optimization
  // Only re-render if data values or key props change
  if (prevProps.data.length !== nextProps.data.length) return false;
  
  for (let i = 0; i < prevProps.data.length; i++) {
    const prevItem = prevProps.data[i];
    const nextItem = nextProps.data[i];
    if (!prevItem || !nextItem) return false;
    
    if (prevItem.value !== nextItem.value ||
        prevItem.label !== nextItem.label ||
        prevItem.color !== nextItem.color) {
      return false;
    }
  }
  
  return (
    prevProps.max === nextProps.max &&
    prevProps.sort === nextProps.sort &&
    prevProps.showValue === nextProps.showValue &&
    prevProps.barChar === nextProps.barChar &&
    prevProps.width === nextProps.width &&
    prevProps.color === nextProps.color
  );
});