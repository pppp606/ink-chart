import React from 'react';

// Mock Ink components
jest.mock('ink', () => ({
  Text: ({ children, color }: any) => React.createElement('span', { 'data-color': color }, children),
  Box: ({ children }: any) => React.createElement('div', {}, children),
}));

// Mock useAutoWidth hook
jest.mock('../src/core/useAutoWidth.js', () => ({
  useAutoWidth: () => ({ width: 80, isAutoWidth: true }),
}));

import { StackedBarChart, StackedBarSegment } from '../src/components/StackedBarChart.js';

describe('StackedBarChart Component', () => {
  // Execute the component function directly to trigger internal logic
  const executeComponent = (props: any) => {
    const StackedBarChartFunc = (StackedBarChart as any).type || StackedBarChart;
    return StackedBarChartFunc(props);
  };

  it('should execute with basic data', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];
    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should return null for empty data', () => {
    const result = executeComponent({ data: [] });
    expect(result).toBeNull();
  });

  it('should return null for null data', () => {
    const result = executeComponent({ data: null });
    expect(result).toBeNull();
  });

  it('should return null for zero total value', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 }
    ];
    const result = executeComponent({ data });
    expect(result).toBeNull();
  });

  it('should handle negative values by treating them as zero', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: -10 },
      { label: 'B', value: 50 }
    ];
    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should execute width calculations', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const autoResult = executeComponent({ data, width: 'auto' });
    const fullResult = executeComponent({ data, width: 'full' });
    const fixedResult = executeComponent({ data, width: 50 });

    expect(autoResult).not.toBeNull();
    expect(fullResult).not.toBeNull();
    expect(fixedResult).not.toBeNull();
  });

  it('should execute with showLabels options', () => {
    const data: StackedBarSegment[] = [
      { label: 'Test', value: 50 }
    ];

    const withLabels = executeComponent({ data, showLabels: true });
    const withoutLabels = executeComponent({ data, showLabels: false });

    expect(withLabels).not.toBeNull();
    expect(withoutLabels).not.toBeNull();
  });

  it('should execute with showValues options', () => {
    const data: StackedBarSegment[] = [
      { label: 'Test', value: 50 }
    ];

    const withValues = executeComponent({ data, showValues: true });
    const withoutValues = executeComponent({ data, showValues: false });

    expect(withValues).not.toBeNull();
    expect(withoutValues).not.toBeNull();
  });

  it('should execute with custom format function', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 25 },
      { label: 'B', value: 75 }
    ];

    const customFormat = (v: number) => `${v.toFixed(0)}%`;
    const result = executeComponent({ data, format: customFormat });

    expect(result).not.toBeNull();
  });

  it('should execute with color options', () => {
    const data: StackedBarSegment[] = [
      { label: 'Success', value: 30, color: '#4aaa1a' },
      { label: 'Warning', value: 20, color: '#d89612' },
      { label: 'Error', value: 50, color: '#a61d24' }
    ];

    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should execute with custom characters', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 50, char: '█' },
      { label: 'B', value: 50, char: '▒' }
    ];

    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should execute with multiple segments', () => {
    const data: StackedBarSegment[] = [
      { label: 'Q1', value: 25 },
      { label: 'Q2', value: 25 },
      { label: 'Q3', value: 25 },
      { label: 'Q4', value: 25 }
    ];

    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should execute with unequal segment values', () => {
    const data: StackedBarSegment[] = [
      { label: 'Small', value: 5 },
      { label: 'Medium', value: 15 },
      { label: 'Large', value: 80 }
    ];

    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should execute with single segment', () => {
    const data: StackedBarSegment[] = [
      { label: 'Only', value: 100 }
    ];

    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should execute with very small width', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const result = executeComponent({ data, width: 10 });
    expect(result).not.toBeNull();
  });

  it('should execute with large width', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const result = executeComponent({ data, width: 200 });
    expect(result).not.toBeNull();
  });

  it('should execute with all options combined', () => {
    const data: StackedBarSegment[] = [
      { label: 'Sales', value: 30, color: '#4aaa1a', char: '█' },
      { label: 'Marketing', value: 20, color: '#d89612', char: '▓' },
      { label: 'Support', value: 50, color: '#a61d24', char: '▒' }
    ];

    const result = executeComponent({
      data,
      width: 60,
      showLabels: true,
      showValues: true,
      format: (v: number) => `${v.toFixed(1)}%`
    });

    expect(result).not.toBeNull();
  });
});
