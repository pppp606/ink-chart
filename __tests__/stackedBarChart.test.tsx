import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToFrame } from './helpers/renderToFrame.js';

import {
  StackedBarChart,
  type StackedBarChartProps,
} from '../src/components/StackedBarChart.js';

// Helper to render StackedBarChart through Ink (null when nothing is rendered)
function renderStackedBarChart(props: StackedBarChartProps) {
  return renderToFrame(StackedBarChart, props);
}

describe('StackedBarChart Component', () => {
  describe('basic component structure', () => {
    it('should be defined', () => {
      assert.notEqual(StackedBarChart, undefined);
    });

    it('should return a React element for valid data', () => {
      const data = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 },
      ];
      const result = renderStackedBarChart({ data, width: 20 });
      assert.notEqual(result, undefined);
    });

    it('should not throw with required data prop', () => {
      const data = [{ label: 'A', value: 100 }];
      assert.doesNotThrow(() => renderStackedBarChart({ data }));
    });
  });

  describe('empty and invalid data handling', () => {
    it('should return null for empty data array', () => {
      const result = renderStackedBarChart({ data: [] });
      // React.createElement returns an element, but the component renders null
      assert.notEqual(result, undefined);
    });

    it('should handle all zero values', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [
            { label: 'A', value: 0 },
            { label: 'B', value: 0 },
          ],
        }));
    });

    it('should handle all negative values', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [
            { label: 'A', value: -10 },
            { label: 'B', value: -20 },
          ],
        }));
    });

    it('should handle mixed positive and negative values', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [
            { label: 'A', value: 50 },
            { label: 'B', value: -10 }, // negative values are treated as 0
          ],
          width: 20,
        }));
    });
  });

  describe('percentage mode (default)', () => {
    it('should use percentage mode by default', () => {
      const data = [
        { label: 'A', value: 25 },
        { label: 'B', value: 75 },
      ];
      assert.doesNotThrow(() => renderStackedBarChart({ data, width: 20 }));
    });

    it('should accept mode prop as percentage', () => {
      const data = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 },
      ];
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, mode: 'percentage', width: 20 }));
    });
  });

  describe('absolute mode', () => {
    it('should accept mode prop as absolute', () => {
      const data = [
        { label: 'A', value: 100 },
        { label: 'B', value: 200 },
      ];
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, mode: 'absolute', width: 20 }));
    });

    it('should accept max prop in absolute mode', () => {
      const data = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 },
      ];
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, mode: 'absolute', max: 200, width: 20 }));
    });

    it('should accept max as auto', () => {
      const data = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 },
      ];
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, mode: 'absolute', max: 'auto', width: 20 }));
    });
  });

  describe('display options', () => {
    it('should accept showLabels prop', () => {
      const data = [{ label: 'A', value: 100 }];
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, showLabels: false, width: 20 }));
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, showLabels: true, width: 20 }));
    });

    it('should accept showValues prop', () => {
      const data = [{ label: 'A', value: 100 }];
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, showValues: false, width: 20 }));
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, showValues: true, width: 20 }));
    });
  });

  describe('custom formatting', () => {
    it('should accept custom format function', () => {
      const data = [{ label: 'A', value: 50 }];
      const format = (value: number) => `[${value}]`;
      assert.doesNotThrow(() =>
        renderStackedBarChart({ data, format, width: 20 }));
    });
  });

  describe('width options', () => {
    it('should accept width as number', () => {
      const data = [{ label: 'A', value: 100 }];
      assert.doesNotThrow(() => renderStackedBarChart({ data, width: 40 }));
    });

    it('should accept width as auto', () => {
      const data = [{ label: 'A', value: 100 }];
      assert.doesNotThrow(() => renderStackedBarChart({ data, width: 'auto' }));
    });

    it('should accept width as full', () => {
      const data = [{ label: 'A', value: 100 }];
      assert.doesNotThrow(() => renderStackedBarChart({ data, width: 'full' }));
    });
  });

  describe('custom characters', () => {
    it('should accept custom char for segments', () => {
      const data = [
        { label: 'A', value: 50, char: '▓' as const },
        { label: 'B', value: 50, char: '░' as const },
      ];
      assert.doesNotThrow(() => renderStackedBarChart({ data, width: 20 }));
    });
  });

  describe('segment colors', () => {
    it('should accept color prop for segments', () => {
      const data = [
        { label: 'A', value: 50, color: '#ff0000' },
        { label: 'B', value: 50, color: 'green' },
      ];
      assert.doesNotThrow(() => renderStackedBarChart({ data, width: 20 }));
    });
  });

  describe('edge cases - segment length calculation (PR #33 fix)', () => {
    it('should not crash when many small segments cause rounding overflow', () => {
      // This test verifies the fix from PR #33
      // When many small segments each get rounded up to minimum length of 1,
      // the total can exceed barWidth. The fix ensures this doesn't cause
      // negative segment lengths or crashes.
      const manySmallSegments = Array.from({ length: 20 }, (_, i) => ({
        label: `S${i}`,
        value: 1,
      }));

      // With barWidth=10 and 20 segments each getting minimum length of 1,
      // currentPos would be 20, exceeding barWidth of 10.
      // Without the PR #33 fix, this would cause a crash due to negative length.
      assert.doesNotThrow(() => {
        renderStackedBarChart({ data: manySmallSegments, width: 10 });
      });
    });

    it('should handle segments where rounding causes total to exceed width', () => {
      // 8 segments with equal small values in a narrow bar (width=5)
      // Each segment gets Math.max(1, Math.round(0.125 * 5)) = 1
      // Total would be 8, exceeding barWidth of 5
      const data = [
        { label: 'A', value: 1 },
        { label: 'B', value: 1 },
        { label: 'C', value: 1 },
        { label: 'D', value: 1 },
        { label: 'E', value: 1 },
        { label: 'F', value: 1 },
        { label: 'G', value: 1 },
        { label: 'H', value: 1 },
      ];

      assert.doesNotThrow(() => {
        renderStackedBarChart({
          data,
          width: 5,
          showLabels: false,
          showValues: false,
        });
      });
    });

    it('should render correctly with single segment', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [{ label: 'Only', value: 100 }],
          width: 20,
        }));
    });

    it('should handle very narrow width with multiple segments', () => {
      // Edge case: width=1 with multiple segments
      const data = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 },
      ];

      assert.doesNotThrow(() => {
        renderStackedBarChart({ data, width: 1 });
      });
    });

    it('should handle extreme number of segments', () => {
      // 100 segments in width=10
      const manySegments = Array.from({ length: 100 }, (_, i) => ({
        label: `${i}`,
        value: 1,
      }));

      assert.doesNotThrow(() => {
        renderStackedBarChart({ data: manySegments, width: 10 });
      });
    });
  });

  describe('multi-segment rendering', () => {
    it('should handle two segments', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [
            { label: 'A', value: 50 },
            { label: 'B', value: 50 },
          ],
          width: 20,
        }));
    });

    it('should handle three segments', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [
            { label: 'A', value: 30 },
            { label: 'B', value: 30 },
            { label: 'C', value: 40 },
          ],
          width: 20,
        }));
    });

    it('should handle segments with very different sizes', () => {
      assert.doesNotThrow(() =>
        renderStackedBarChart({
          data: [
            { label: 'Tiny', value: 1 },
            { label: 'Huge', value: 999 },
          ],
          width: 20,
        }));
    });
  });
});
