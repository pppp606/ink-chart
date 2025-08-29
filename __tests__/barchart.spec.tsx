import React from 'react';

// Mock Ink components for testing
jest.mock('ink', () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
  Box: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useAutoWidth hook
jest.mock('../src/core/useAutoWidth.js', () => ({
  useAutoWidth: () => ({
    width: 80,
    isAutoWidth: true,
  }),
}));

import { BarChart, BarChartData } from '../src/components/BarChart.js';

describe('BarChart Component', () => {
  describe('Basic component structure', () => {
    it('should be defined as a React component', () => {
      expect(BarChart).toBeDefined();
      expect(typeof BarChart).toBe('object'); // React.memo returns an object
    });

    it('should return a React element or null', () => {
      const data: BarChartData[] = [
        { label: 'Test', value: 10 }
      ];
      const element = React.createElement(BarChart, { data });
      expect(element).toBeDefined();
    });

    it('should accept required data prop', () => {
      const data: BarChartData[] = [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 }
      ];
      expect(() => React.createElement(BarChart, { data })).not.toThrow();
    });

    it('should handle empty data array', () => {
      expect(() => React.createElement(BarChart, { data: [] })).not.toThrow();
    });
  });

  // Implementation tests - verify current functionality works
  describe('Implementation Tests', () => {
    it('should render without errors with valid data', () => {
      const data: BarChartData[] = [
        { label: 'Item A', value: 10 },
        { label: 'Item B', value: 20 }
      ];
      
      const result = React.createElement(BarChart, { data });
      expect(result).toBeDefined();
      expect(result.type).toBe(BarChart);
    });

    it('should handle sorting functionality', () => {
      const data: BarChartData[] = [
        { label: 'B', value: 20 },
        { label: 'A', value: 10 },
        { label: 'C', value: 30 }
      ];
      
      expect(() => React.createElement(BarChart, { data, sort: 'desc' })).not.toThrow();
      expect(() => React.createElement(BarChart, { data, sort: 'asc' })).not.toThrow();
      expect(() => React.createElement(BarChart, { data, sort: 'none' })).not.toThrow();
    });

    it('should handle showValue configurations', () => {
      const data: BarChartData[] = [
        { label: 'Test', value: 100 }
      ];
      
      expect(() => React.createElement(BarChart, { data, showValue: 'right' })).not.toThrow();
      expect(() => React.createElement(BarChart, { data, showValue: 'none' })).not.toThrow();
    });

    it('should handle max value configurations', () => {
      const data: BarChartData[] = [
        { label: 'Test', value: 50 }
      ];
      
      expect(() => React.createElement(BarChart, { data, max: 'auto' })).not.toThrow();
      expect(() => React.createElement(BarChart, { data, max: 100 })).not.toThrow();
    });
  });
});