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

import { BarChart, BarChartData } from '../src/components/BarChart.js';

describe('BarChart Component', () => {
  // Execute the component function directly to trigger internal logic
  const executeComponent = (props: any) => {
    const BarChartFunc = (BarChart as any).type || BarChart;
    return BarChartFunc(props);
  };

  it('should execute with basic data', () => {
    const data: BarChartData[] = [{ label: 'Test', value: 10 }];
    const result = executeComponent({ data });
    expect(result).not.toBeNull();
  });

  it('should return null for empty data', () => {
    const result = executeComponent({ data: [] });
    expect(result).toBeNull();
  });

  it('should execute sorting functions', () => {
    const data: BarChartData[] = [
      { label: 'B', value: 10 },
      { label: 'A', value: 20 },
      { label: 'C', value: 15 }
    ];
    
    const descResult = executeComponent({ data, sort: 'desc' });
    const ascResult = executeComponent({ data, sort: 'asc' });
    const noneResult = executeComponent({ data, sort: 'none' });
    
    expect(descResult).not.toBeNull();
    expect(ascResult).not.toBeNull();
    expect(noneResult).not.toBeNull();
  });

  it('should execute width calculations', () => {
    const data: BarChartData[] = [{ label: 'Test', value: 50 }];
    
    const autoResult = executeComponent({ data, width: 'auto' });
    const fullResult = executeComponent({ data, width: 'full' });
    const fixedResult = executeComponent({ data, width: 50 });
    
    expect(autoResult).not.toBeNull();
    expect(fullResult).not.toBeNull();
    expect(fixedResult).not.toBeNull();
  });

  it('should execute value display options', () => {
    const data: BarChartData[] = [{ label: 'Item', value: 42 }];
    
    const rightResult = executeComponent({ data, showValue: 'right' });
    const noneResult = executeComponent({ data, showValue: 'none' });
    
    expect(rightResult).not.toBeNull();
    expect(noneResult).not.toBeNull();
  });

  it('should execute max value calculations', () => {
    const data: BarChartData[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];
    
    const autoResult = executeComponent({ data, max: 'auto' });
    const fixedResult = executeComponent({ data, max: 100 });
    
    expect(autoResult).not.toBeNull();
    expect(fixedResult).not.toBeNull();
  });

  it('should execute bar character options', () => {
    const data: BarChartData[] = [{ label: 'Test', value: 25 }];
    
    const chars = ['▆', '█', '▓', '▒', '░'];
    chars.forEach(barChar => {
      const result = executeComponent({ data, barChar });
      expect(result).not.toBeNull();
    });
  });

  it('should execute color options', () => {
    const data: BarChartData[] = [
      { label: 'Colored', value: 30, color: '#ff0000' },
      { label: 'Default', value: 40 }
    ];
    
    const colorResult = executeComponent({ data, color: '#00ff00' });
    const noColorResult = executeComponent({ data });
    
    expect(colorResult).not.toBeNull();
    expect(noColorResult).not.toBeNull();
  });

  it('should execute format function', () => {
    const data: BarChartData[] = [{ label: 'Sales', value: 1000 }];
    
    const formatResult = executeComponent({ 
      data, 
      showValue: 'right',
      format: (v: number) => `$${v}K` 
    });
    
    expect(formatResult).not.toBeNull();
  });

  it('should handle zero maxValue edge case', () => {
    const data: BarChartData[] = [{ label: 'Zero', value: 0 }];
    const result = executeComponent({ data });
    expect(result).toBeNull();
  });

  it('should execute complex combinations', () => {
    const data: BarChartData[] = [
      { label: 'Success', value: 85.5, color: '#4CAF50' },
      { label: 'Warning', value: 12.3, color: '#FF9800' },
      { label: 'Error', value: 2.2, color: '#F44336' }
    ];
    
    const result = executeComponent({ 
      data, 
      sort: 'desc', 
      showValue: 'right', 
      format: (v: number) => `${v.toFixed(1)}%`,
      barChar: '▓',
      width: 60,
      max: 100,
      color: '#333333'
    });
    
    expect(result).not.toBeNull();
  });
});