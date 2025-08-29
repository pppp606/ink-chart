import React from 'react';

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

export function BarChart(_props: BarChartProps): React.ReactElement | null {
  return null;
}