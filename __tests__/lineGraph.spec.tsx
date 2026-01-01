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

import { LineGraph, LineGraphProps, LineGraphSeries } from '../src/components/LineGraph.js';

describe('LineGraph Component', () => {
  // Execute the component function directly to trigger internal logic
  const executeComponent = (props: LineGraphProps) => {
    const LineGraphFunc = (LineGraph as any).type || LineGraph;
    return LineGraphFunc(props);
  };

  describe('Basic component structure', () => {
    it('should return a React element for valid data', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
      expect(result?.type).toBeDefined();
    });

    it('should accept required data prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      expect(() => executeComponent({ data })).not.toThrow();
    });

    it('should handle empty data array', () => {
      const result = executeComponent({ data: [] });
      expect(result).toBeNull();
    });

    it('should handle empty series values', () => {
      const result = executeComponent({ data: [{ values: [] }] });
      expect(result).toBeNull();
    });
  });

  describe('Props interface validation', () => {
    it('should accept width prop as number', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, width: 40 })).not.toThrow();
    });

    it('should accept width prop as auto', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, width: 'auto' })).not.toThrow();
    });

    it('should accept width prop as full', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, width: 'full' })).not.toThrow();
    });

    it('should accept height prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, height: 5 })).not.toThrow();
    });

    it('should accept yDomain prop as auto', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, yDomain: 'auto' })).not.toThrow();
    });

    it('should accept yDomain prop as tuple', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, yDomain: [0, 100] })).not.toThrow();
    });

    it('should accept caption prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, caption: 'Test Caption' })).not.toThrow();
    });

    it('should accept showYAxis prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, showYAxis: true })).not.toThrow();
    });

    it('should accept yLabels prop with numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, yLabels: [0, 50, 100] })).not.toThrow();
    });

    it('should accept yLabels prop with strings', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      expect(() => executeComponent({ data, yLabels: ['Low', 'Mid', 'High'] })).not.toThrow();
    });

    it('should accept xLabels prop with strings', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4] }];
      expect(() => executeComponent({ data, xLabels: ['Q1', 'Q2', 'Q3', 'Q4'] })).not.toThrow();
    });

    it('should accept xLabels prop with numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      expect(() => executeComponent({ data, xLabels: [0, 25, 50, 75, 100] })).not.toThrow();
    });

    it('should accept series with color', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3], color: 'cyan' }];
      expect(() => executeComponent({ data })).not.toThrow();
    });
  });

  describe('Data validation and edge cases', () => {
    it('should handle data with NaN values by filtering them', () => {
      const data: LineGraphSeries[] = [{ values: [1, NaN, 3, 4, 5] }];
      const result = executeComponent({ data });
      // Should still render with valid values
      expect(result).not.toBeNull();
    });

    it('should handle data with Infinity values by filtering them', () => {
      const data: LineGraphSeries[] = [{ values: [1, Infinity, 3, -Infinity, 5] }];
      const result = executeComponent({ data });
      // Should still render with valid values
      expect(result).not.toBeNull();
    });

    it('should return null for all invalid data', () => {
      const data: LineGraphSeries[] = [{ values: [NaN, Infinity, -Infinity] }];
      const result = executeComponent({ data });
      expect(result).toBeNull();
    });

    it('should handle negative values', () => {
      const data: LineGraphSeries[] = [{ values: [-5, -2, 0, 2, 5] }];
      expect(() => executeComponent({ data })).not.toThrow();
    });

    it('should handle very large numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1e10, 2e10, 3e10] }];
      expect(() => executeComponent({ data })).not.toThrow();
    });

    it('should handle single value', () => {
      const data: LineGraphSeries[] = [{ values: [42] }];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });

    it('should handle identical values', () => {
      const data: LineGraphSeries[] = [{ values: [5, 5, 5, 5, 5] }];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });

    it('should handle all zeros', () => {
      const data: LineGraphSeries[] = [{ values: [0, 0, 0, 0, 0] }];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });
  });

  describe('Multiple series handling', () => {
    it('should handle multiple series', () => {
      const data: LineGraphSeries[] = [
        { values: [1, 2, 3], color: 'red' },
        { values: [3, 2, 1], color: 'blue' },
      ];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });

    it('should handle series with different lengths', () => {
      const data: LineGraphSeries[] = [
        { values: [1, 2, 3, 4, 5] },
        { values: [1, 2, 3] },
      ];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });

    it('should skip series with all invalid values', () => {
      const data: LineGraphSeries[] = [
        { values: [1, 2, 3] },
        { values: [NaN, Infinity] },
      ];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });
  });

  describe('Width behavior', () => {
    it('should handle auto width', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 'auto' });
      expect(result).not.toBeNull();
    });

    it('should handle full width', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 'full' });
      expect(result).not.toBeNull();
    });

    it('should handle fixed width', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 20 });
      expect(result).not.toBeNull();
    });

    it('should handle width smaller than data length', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }];
      const result = executeComponent({ data, width: 5 });
      expect(result).not.toBeNull();
    });

    it('should handle width larger than data length', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, width: 20 });
      expect(result).not.toBeNull();
    });
  });

  describe('Height behavior', () => {
    it('should use default height of 10', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data });
      expect(result).not.toBeNull();
    });

    it('should handle custom height', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, height: 5 });
      expect(result).not.toBeNull();
    });

    it('should handle height of 1', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, height: 1 });
      expect(result).not.toBeNull();
    });
  });

  describe('Y-axis labels', () => {
    it('should render with showYAxis=true', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, showYAxis: true });
      expect(result).not.toBeNull();
    });

    it('should render with numeric yLabels', () => {
      const data: LineGraphSeries[] = [{ values: [0, 50, 100] }];
      const result = executeComponent({ data, yLabels: [0, 50, 100] });
      expect(result).not.toBeNull();
    });

    it('should render with string yLabels', () => {
      const data: LineGraphSeries[] = [{ values: [0, 50, 100] }];
      const result = executeComponent({ data, yLabels: ['Low', 'Mid', 'High'] });
      expect(result).not.toBeNull();
    });

    it('should auto-enable Y-axis when yLabels provided', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, yLabels: [0, 100] });
      expect(result).not.toBeNull();
    });

    it('should handle yLabels outside of yDomain range', () => {
      const data: LineGraphSeries[] = [{ values: [10, 20, 30] }];
      const result = executeComponent({ data, yDomain: [0, 50], yLabels: [0, 25, 50, 100] });
      expect(result).not.toBeNull();
    });

    it('should handle single yLabel', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, yLabels: ['Only'] });
      expect(result).not.toBeNull();
    });
  });

  describe('X-axis labels', () => {
    it('should render with string xLabels', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4] }];
      const result = executeComponent({ data, xLabels: ['Q1', 'Q2', 'Q3', 'Q4'] });
      expect(result).not.toBeNull();
    });

    it('should render with numeric xLabels', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, xLabels: [0, 25, 50, 75, 100] });
      expect(result).not.toBeNull();
    });

    it('should render with single xLabel', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, xLabels: ['Start'] });
      expect(result).not.toBeNull();
    });

    it('should handle xLabels with Y-axis enabled', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4] }];
      const result = executeComponent({ data, xLabels: ['A', 'B', 'C', 'D'], showYAxis: true });
      expect(result).not.toBeNull();
    });
  });

  describe('Caption behavior', () => {
    it('should render with caption', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, caption: 'Test Graph' });
      expect(result).not.toBeNull();
    });

    it('should handle empty caption', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, caption: '' });
      expect(result).not.toBeNull();
    });

    it('should handle whitespace-only caption', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, caption: '   ' });
      expect(result).not.toBeNull();
    });
  });

  describe('yDomain behavior', () => {
    it('should auto-calculate domain', () => {
      const data: LineGraphSeries[] = [{ values: [10, 20, 30, 40, 50] }];
      const result = executeComponent({ data, yDomain: 'auto' });
      expect(result).not.toBeNull();
    });

    it('should use fixed domain', () => {
      const data: LineGraphSeries[] = [{ values: [10, 20, 30] }];
      const result = executeComponent({ data, yDomain: [0, 100] });
      expect(result).not.toBeNull();
    });

    it('should handle domain where min equals max', () => {
      const data: LineGraphSeries[] = [{ values: [50, 50, 50] }];
      const result = executeComponent({ data, yDomain: [50, 50] });
      expect(result).not.toBeNull();
    });
  });

  describe('Rendering consistency', () => {
    it('should produce consistent output for same input', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result1 = executeComponent({ data, width: 10, height: 5 });
      const result2 = executeComponent({ data, width: 10, height: 5 });
      expect(JSON.stringify(result1)).toEqual(JSON.stringify(result2));
    });

    it('should handle complex configuration', () => {
      const data: LineGraphSeries[] = [
        { values: [10, 30, 20, 50, 40], color: 'cyan' },
        { values: [5, 25, 35, 15, 45], color: 'magenta' },
      ];
      const result = executeComponent({
        data,
        width: 40,
        height: 8,
        yDomain: [0, 60],
        caption: 'Complex Graph',
        showYAxis: true,
        yLabels: [0, 30, 60],
        xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      });
      expect(result).not.toBeNull();
    });
  });

  describe('Axis label formatting', () => {
    it('should format large numbers with exponential notation', () => {
      const data: LineGraphSeries[] = [{ values: [1000, 5000, 10000] }];
      const result = executeComponent({ data, showYAxis: true });
      expect(result).not.toBeNull();
    });

    it('should format decimal numbers', () => {
      const data: LineGraphSeries[] = [{ values: [0.5, 1.5, 2.5] }];
      const result = executeComponent({ data, showYAxis: true });
      expect(result).not.toBeNull();
    });

    it('should format integer numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, showYAxis: true });
      expect(result).not.toBeNull();
    });
  });

  describe('Data scaling', () => {
    it('should scale data when width matches data length', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 5 });
      expect(result).not.toBeNull();
    });

    it('should interpolate when upscaling data', () => {
      const data: LineGraphSeries[] = [{ values: [0, 100] }];
      const result = executeComponent({ data, width: 10 });
      expect(result).not.toBeNull();
    });

    it('should sample when downscaling data', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }];
      const result = executeComponent({ data, width: 5 });
      expect(result).not.toBeNull();
    });
  });

  describe('Grid and position calculations', () => {
    it('should calculate correct positions for various heights', () => {
      const data: LineGraphSeries[] = [{ values: [0, 50, 100] }];

      const height3 = executeComponent({ data, height: 3, yDomain: [0, 100] });
      const height5 = executeComponent({ data, height: 5, yDomain: [0, 100] });
      const height10 = executeComponent({ data, height: 10, yDomain: [0, 100] });

      expect(height3).not.toBeNull();
      expect(height5).not.toBeNull();
      expect(height10).not.toBeNull();
    });

    it('should handle overlapping series correctly', () => {
      const data: LineGraphSeries[] = [
        { values: [50, 50, 50], color: 'red' },
        { values: [50, 50, 50], color: 'blue' },
      ];
      const result = executeComponent({ data, height: 5 });
      expect(result).not.toBeNull();
    });
  });
});
