import React from 'react';

// Mock Ink components for testing
jest.mock('ink', () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
  Box: ({ children }: { children: React.ReactNode }) => children,
}));

import { BarChart, BarChartData } from '../src/components/BarChart.js';

describe('BarChart Component', () => {
  describe('Basic component structure', () => {
    it('should be defined as a function', () => {
      expect(typeof BarChart).toBe('function');
    });

    it('should return a React element or null', () => {
      const data: BarChartData[] = [
        { label: 'Test', value: 10 }
      ];
      const result = BarChart({ data });
      expect(result).toBeDefined();
    });

    it('should accept required data prop', () => {
      const data: BarChartData[] = [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 }
      ];
      expect(() => BarChart({ data })).not.toThrow();
    });

    it('should handle empty data array', () => {
      expect(() => BarChart({ data: [] })).not.toThrow();
    });
  });

  // RED PHASE TESTS - These should all fail initially
  describe('Red Phase - Failing Tests', () => {
    // Test 1: Bar length calculation
    it('should render bars with correct length based on value/max ratio when width=40', () => {
      const data: BarChartData[] = [
        { label: 'Item A', value: 10 },
        { label: 'Item B', value: 20 },
        { label: 'Item C', value: 5 }
      ];
      
      const result = BarChart({ data, width: 40, max: 20 });
      
      // This test expects the component to render bars with specific lengths
      // Bar A should be 50% of max bar length (10/20 = 0.5)
      // Bar B should be 100% of max bar length (20/20 = 1.0)
      // Bar C should be 25% of max bar length (5/20 = 0.25)
      
      expect(result).not.toBeNull();
      expect(result?.type).toBeDefined();
      
      // The component should render bars with proper proportional lengths
      // This will fail until we implement the bar length calculation logic
      const renderedContent = (result as any)?.props?.children;
      expect(renderedContent).toContain('█'); // Should contain bar characters
    });

    // Test 2: ShowValue positioning  
    it('should position values to the right of bars when showValue="right"', () => {
      const data: BarChartData[] = [
        { label: 'Sales', value: 150 },
        { label: 'Marketing', value: 75 }
      ];
      
      const result = BarChart({ data, showValue: 'right', width: 30 });
      
      expect(result).not.toBeNull();
      
      // Should render with values positioned to the right of bars
      // This will fail until we implement the showValue positioning logic
      const renderedContent = (result as any)?.props?.children;
      expect(renderedContent).toContain('150'); // Should show the values
      expect(renderedContent).toContain('75');
      
      // Values should be positioned after the bars
      // This specific formatting expectation will fail initially
      expect(renderedContent).toMatch(/█+\s+150/); // Bar followed by spaces and value
    });

    // Test 3: Label truncation
    it('should truncate long labels with ellipsis within label area bounds', () => {
      const data: BarChartData[] = [
        { label: 'Very Long Label That Should Be Truncated', value: 100 },
        { label: 'Short', value: 50 }
      ];
      
      const result = BarChart({ data, width: 30 });
      
      expect(result).not.toBeNull();
      
      // Should truncate the long label with ellipsis (…)
      // This will fail until we implement label truncation logic
      const renderedContent = (result as any)?.props?.children;
      expect(renderedContent).toContain('…'); // Should contain ellipsis for truncated label
      expect(renderedContent).not.toContain('Very Long Label That Should Be Truncated'); // Full text should not appear
    });

    // Test 4: Sorting functionality
    it('should produce correct row ordering based on sort parameter', () => {
      const data: BarChartData[] = [
        { label: 'B Item', value: 20 },
        { label: 'A Item', value: 10 },
        { label: 'C Item', value: 30 }
      ];
      
      // Test descending sort
      const descResult = BarChart({ data, sort: 'desc' });
      expect(descResult).not.toBeNull();
      
      // Test ascending sort  
      const ascResult = BarChart({ data, sort: 'asc' });
      expect(ascResult).not.toBeNull();
      
      // Test no sort (original order)
      const noneResult = BarChart({ data, sort: 'none' });
      expect(noneResult).not.toBeNull();
      
      // Results should be different based on sorting
      // This will fail until we implement sorting logic
      const descContent = (descResult as any)?.props?.children;
      const ascContent = (ascResult as any)?.props?.children;
      const noneContent = (noneResult as any)?.props?.children;
      
      expect(descContent).not.toEqual(ascContent);
      expect(ascContent).not.toEqual(noneContent);
      
      // Descending should show C Item (30) first, then B Item (20), then A Item (10)
      expect(descContent?.toString()).toMatch(/C Item.*B Item.*A Item/s);
    });

    // Test 5: Max value handling
    it('should handle max="auto" vs fixed max values affecting bar lengths', () => {
      const data: BarChartData[] = [
        { label: 'Low', value: 10 },
        { label: 'High', value: 20 }
      ];
      
      // Test with auto max (should use data max of 20)
      const autoResult = BarChart({ data, max: 'auto', width: 20 });
      expect(autoResult).not.toBeNull();
      
      // Test with fixed max of 40 (bars should be shorter relative to this max)
      const fixedResult = BarChart({ data, max: 40, width: 20 });
      expect(fixedResult).not.toBeNull();
      
      // Bar lengths should be different between auto and fixed max
      // This will fail until we implement max value handling logic
      const autoContent = (autoResult as any)?.props?.children;
      const fixedContent = (fixedResult as any)?.props?.children;
      
      expect(autoContent).not.toEqual(fixedContent);
      
      // With auto max, "High" should be full length
      // With fixed max of 40, "High" (20) should be half length
      expect(autoContent).toBeDefined();
      expect(fixedContent).toBeDefined();
    });
  });
});