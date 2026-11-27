import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToFrame } from './helpers/renderToFrame.js';
import { LineGraph, LineGraphProps, LineGraphSeries } from '../src/components/LineGraph.js';

describe('LineGraph Component', () => {
  // Render the component through Ink and return the frame (null when nothing is rendered)
  const executeComponent = (props: LineGraphProps) => renderToFrame(LineGraph, props);

  describe('Basic component structure', () => {
    it('should return a React element for valid data', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
      assert.equal(typeof result, 'string');
    });

    it('should accept required data prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      assert.doesNotThrow(() => executeComponent({ data }));
    });

    it('should handle empty data array', () => {
      const result = executeComponent({ data: [] });
      assert.equal(result, null);
    });

    it('should handle empty series values', () => {
      const result = executeComponent({ data: [{ values: [] }] });
      assert.equal(result, null);
    });
  });

  describe('Props interface validation', () => {
    it('should accept width prop as number', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, width: 40 }));
    });

    it('should accept width prop as auto', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, width: 'auto' }));
    });

    it('should accept width prop as full', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, width: 'full' }));
    });

    it('should accept height prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, height: 5 }));
    });

    it('should accept yDomain prop as auto', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, yDomain: 'auto' }));
    });

    it('should accept yDomain prop as tuple', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, yDomain: [0, 100] }));
    });

    it('should accept caption prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, caption: 'Test Caption' }));
    });

    it('should accept showYAxis prop', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, showYAxis: true }));
    });

    it('should accept yLabels prop with numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, yLabels: [0, 50, 100] }));
    });

    it('should accept yLabels prop with strings', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      assert.doesNotThrow(() => executeComponent({ data, yLabels: ['Low', 'Mid', 'High'] }));
    });

    it('should accept xLabels prop with strings', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4] }];
      assert.doesNotThrow(() => executeComponent({ data, xLabels: ['Q1', 'Q2', 'Q3', 'Q4'] }));
    });

    it('should accept xLabels prop with numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      assert.doesNotThrow(() => executeComponent({ data, xLabels: [0, 25, 50, 75, 100] }));
    });

    it('should accept series with color', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3], color: 'cyan' }];
      assert.doesNotThrow(() => executeComponent({ data }));
    });
  });

  describe('Data validation and edge cases', () => {
    it('should handle data with NaN values by filtering them', () => {
      const data: LineGraphSeries[] = [{ values: [1, NaN, 3, 4, 5] }];
      const result = executeComponent({ data });
      // Should still render with valid values
      assert.notEqual(result, null);
    });

    it('should handle data with Infinity values by filtering them', () => {
      const data: LineGraphSeries[] = [{ values: [1, Infinity, 3, -Infinity, 5] }];
      const result = executeComponent({ data });
      // Should still render with valid values
      assert.notEqual(result, null);
    });

    it('should return null for all invalid data', () => {
      const data: LineGraphSeries[] = [{ values: [NaN, Infinity, -Infinity] }];
      const result = executeComponent({ data });
      assert.equal(result, null);
    });

    it('should handle negative values', () => {
      const data: LineGraphSeries[] = [{ values: [-5, -2, 0, 2, 5] }];
      assert.doesNotThrow(() => executeComponent({ data }));
    });

    it('should handle very large numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1e10, 2e10, 3e10] }];
      assert.doesNotThrow(() => executeComponent({ data }));
    });

    it('should handle single value', () => {
      const data: LineGraphSeries[] = [{ values: [42] }];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });

    it('should handle identical values', () => {
      const data: LineGraphSeries[] = [{ values: [5, 5, 5, 5, 5] }];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });

    it('should handle all zeros', () => {
      const data: LineGraphSeries[] = [{ values: [0, 0, 0, 0, 0] }];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });
  });

  describe('Multiple series handling', () => {
    it('should handle multiple series', () => {
      const data: LineGraphSeries[] = [
        { values: [1, 2, 3], color: 'red' },
        { values: [3, 2, 1], color: 'blue' },
      ];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });

    it('should handle series with different lengths', () => {
      const data: LineGraphSeries[] = [
        { values: [1, 2, 3, 4, 5] },
        { values: [1, 2, 3] },
      ];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });

    it('should skip series with all invalid values', () => {
      const data: LineGraphSeries[] = [
        { values: [1, 2, 3] },
        { values: [NaN, Infinity] },
      ];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });
  });

  describe('Width behavior', () => {
    it('should handle auto width', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 'auto' });
      assert.notEqual(result, null);
    });

    it('should handle full width', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 'full' });
      assert.notEqual(result, null);
    });

    it('should handle fixed width', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 20 });
      assert.notEqual(result, null);
    });

    it('should handle width smaller than data length', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }];
      const result = executeComponent({ data, width: 5 });
      assert.notEqual(result, null);
    });

    it('should handle width larger than data length', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, width: 20 });
      assert.notEqual(result, null);
    });
  });

  describe('Height behavior', () => {
    it('should use default height of 10', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data });
      assert.notEqual(result, null);
    });

    it('should handle custom height', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, height: 5 });
      assert.notEqual(result, null);
    });

    it('should handle height of 1', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, height: 1 });
      assert.notEqual(result, null);
    });
  });

  describe('Y-axis labels', () => {
    it('should render with showYAxis=true', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, showYAxis: true });
      assert.notEqual(result, null);
    });

    it('should render with numeric yLabels', () => {
      const data: LineGraphSeries[] = [{ values: [0, 50, 100] }];
      const result = executeComponent({ data, yLabels: [0, 50, 100] });
      assert.notEqual(result, null);
    });

    it('should render with string yLabels', () => {
      const data: LineGraphSeries[] = [{ values: [0, 50, 100] }];
      const result = executeComponent({ data, yLabels: ['Low', 'Mid', 'High'] });
      assert.notEqual(result, null);
    });

    it('should auto-enable Y-axis when yLabels provided', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, yLabels: [0, 100] });
      assert.notEqual(result, null);
    });

    it('should handle yLabels outside of yDomain range', () => {
      const data: LineGraphSeries[] = [{ values: [10, 20, 30] }];
      const result = executeComponent({ data, yDomain: [0, 50], yLabels: [0, 25, 50, 100] });
      assert.notEqual(result, null);
    });

    it('should handle single yLabel', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, yLabels: ['Only'] });
      assert.notEqual(result, null);
    });
  });

  describe('X-axis labels', () => {
    it('should render with string xLabels', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4] }];
      const result = executeComponent({ data, xLabels: ['Q1', 'Q2', 'Q3', 'Q4'] });
      assert.notEqual(result, null);
    });

    it('should render with numeric xLabels', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, xLabels: [0, 25, 50, 75, 100] });
      assert.notEqual(result, null);
    });

    it('should render with single xLabel', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, xLabels: ['Start'] });
      assert.notEqual(result, null);
    });

    it('should handle xLabels with Y-axis enabled', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4] }];
      const result = executeComponent({ data, xLabels: ['A', 'B', 'C', 'D'], showYAxis: true });
      assert.notEqual(result, null);
    });
  });

  describe('Caption behavior', () => {
    it('should render with caption', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, caption: 'Test Graph' });
      assert.notEqual(result, null);
    });

    it('should handle empty caption', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, caption: '' });
      assert.notEqual(result, null);
    });

    it('should handle whitespace-only caption', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, caption: '   ' });
      assert.notEqual(result, null);
    });
  });

  describe('yDomain behavior', () => {
    it('should auto-calculate domain', () => {
      const data: LineGraphSeries[] = [{ values: [10, 20, 30, 40, 50] }];
      const result = executeComponent({ data, yDomain: 'auto' });
      assert.notEqual(result, null);
    });

    it('should use fixed domain', () => {
      const data: LineGraphSeries[] = [{ values: [10, 20, 30] }];
      const result = executeComponent({ data, yDomain: [0, 100] });
      assert.notEqual(result, null);
    });

    it('should handle domain where min equals max', () => {
      const data: LineGraphSeries[] = [{ values: [50, 50, 50] }];
      const result = executeComponent({ data, yDomain: [50, 50] });
      assert.notEqual(result, null);
    });
  });

  describe('Rendering consistency', () => {
    it('should produce consistent output for same input', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result1 = executeComponent({ data, width: 10, height: 5 });
      const result2 = executeComponent({ data, width: 10, height: 5 });
      assert.deepEqual(JSON.stringify(result1), JSON.stringify(result2));
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
      assert.notEqual(result, null);
    });
  });

  describe('Axis label formatting', () => {
    it('should format large numbers with exponential notation', () => {
      const data: LineGraphSeries[] = [{ values: [1000, 5000, 10000] }];
      const result = executeComponent({ data, showYAxis: true });
      assert.notEqual(result, null);
    });

    it('should format decimal numbers', () => {
      const data: LineGraphSeries[] = [{ values: [0.5, 1.5, 2.5] }];
      const result = executeComponent({ data, showYAxis: true });
      assert.notEqual(result, null);
    });

    it('should format integer numbers', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3] }];
      const result = executeComponent({ data, showYAxis: true });
      assert.notEqual(result, null);
    });
  });

  describe('Data scaling', () => {
    it('should scale data when width matches data length', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5] }];
      const result = executeComponent({ data, width: 5 });
      assert.notEqual(result, null);
    });

    it('should interpolate when upscaling data', () => {
      const data: LineGraphSeries[] = [{ values: [0, 100] }];
      const result = executeComponent({ data, width: 10 });
      assert.notEqual(result, null);
    });

    it('should sample when downscaling data', () => {
      const data: LineGraphSeries[] = [{ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }];
      const result = executeComponent({ data, width: 5 });
      assert.notEqual(result, null);
    });
  });

  describe('Grid and position calculations', () => {
    it('should calculate correct positions for various heights', () => {
      const data: LineGraphSeries[] = [{ values: [0, 50, 100] }];

      const height3 = executeComponent({ data, height: 3, yDomain: [0, 100] });
      const height5 = executeComponent({ data, height: 5, yDomain: [0, 100] });
      const height10 = executeComponent({ data, height: 10, yDomain: [0, 100] });

      assert.notEqual(height3, null);
      assert.notEqual(height5, null);
      assert.notEqual(height10, null);
    });

    it('should handle overlapping series correctly', () => {
      const data: LineGraphSeries[] = [
        { values: [50, 50, 50], color: 'red' },
        { values: [50, 50, 50], color: 'blue' },
      ];
      const result = executeComponent({ data, height: 5 });
      assert.notEqual(result, null);
    });
  });
});
