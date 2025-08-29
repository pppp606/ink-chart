import React from 'react';

export interface SparklineProps {
  data: number[];
  width?: 'auto' | number;
  height?: 1 | 2 | 'braille';
  mode?: 'braille' | 'block';
  yDomain?: 'auto' | [number, number];
  threshold?: number;
  caption?: string;
}

export function Sparkline(_props: SparklineProps): React.ReactElement | null {
  return null;
}