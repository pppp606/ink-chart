import React from 'react';
import { Text, Box } from 'ink';
import { measureWidth, truncateText } from '../measure.js';
import { calculateLayout } from '../barchart.layout.js';

export interface BarChartData {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartData[];
  max?: 'auto' | number;
  sort?: 'none' | 'asc' | 'desc';
  showValue?: 'right' | 'inside' | 'none';
  format?: (value: number) => string;
  barChar?: '█' | '▓' | '▒' | '░';
  padding?: 0 | 1 | 2;
  width?: 'auto' | number;
}

export function BarChart(props: BarChartProps): React.ReactElement | null {
  const {
    data,
    max = 'auto',
    sort = 'none',
    showValue = 'none',
    format = (value: number) => value.toString(),
    barChar = '█',
    padding = 0,
    width = 'auto'
  } = props;

  // Handle empty data
  if (!data || data.length === 0) {
    return null;
  }

  // Sort data if needed
  const sortedData = [...data];
  if (sort === 'asc') {
    sortedData.sort((a, b) => a.value - b.value);
  } else if (sort === 'desc') {
    sortedData.sort((a, b) => b.value - a.value);
  }

  // Calculate max value
  const maxValue = max === 'auto' ? Math.max(...sortedData.map(d => d.value)) : max;
  
  // Handle case where maxValue is 0 or negative
  if (maxValue <= 0) {
    return null;
  }

  // Calculate layout if width is specified
  let layout: { labelWidth: number; barWidth: number; valueWidth: number } | null = null;
  if (typeof width === 'number') {
    // Calculate needed widths
    const maxLabelWidth = Math.max(...sortedData.map(d => measureWidth(d.label)));
    const maxValueWidth = showValue === 'right' ? 
      Math.max(...sortedData.map(d => measureWidth(format(d.value)))) : 0;
    
    layout = calculateLayout({
      totalWidth: width,
      labelWidth: maxLabelWidth,
      valueWidth: showValue === 'right' ? maxValueWidth + 1 : maxValueWidth, // +1 for space before value
      minBarWidth: 1
    });
  }

  const rows = sortedData.map(item => {
    const { label, value } = item;
    const ratio = value / maxValue;
    
    let displayLabel = label;
    let barLength: number;
    let displayValue = showValue === 'right' ? format(value) : '';

    if (layout) {
      // Use calculated layout
      displayLabel = truncateText(label, layout.labelWidth);
      barLength = Math.max(1, Math.floor(ratio * layout.barWidth));
      displayValue = showValue === 'right' ? format(value) : '';
    } else {
      // Auto width - simple calculation
      barLength = Math.max(1, Math.floor(ratio * 20)); // Default bar length
    }

    const bar = barChar.repeat(barLength);

    if (layout && showValue === 'right') {
      // Fixed width layout with values on the right
      const labelPart = displayLabel.padEnd(layout.labelWidth);
      // Ensure space between bars and values
      const barPart = bar + ' '.repeat(Math.max(1, layout.barWidth - bar.length));
      const valuePart = displayValue.padStart(layout.valueWidth - 1); // -1 for the space we added
      return labelPart + barPart + valuePart;
    } else if (showValue === 'right') {
      // Auto width with values on the right - ensure proper spacing
      return `${displayLabel} ${bar} ${displayValue}`;
    } else {
      // No values shown or different positioning
      return layout ? displayLabel.padEnd(layout.labelWidth) + bar : `${displayLabel} ${bar}`;
    }
  });

  return (
    <Text>{rows.join('\n')}</Text>
  );
}