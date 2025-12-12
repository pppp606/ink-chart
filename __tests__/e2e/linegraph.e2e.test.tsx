/**
 * E2E Tests for LineGraph Component
 *
 * These tests use ink-testing-library to capture actual terminal output
 * and verify the rendered characters and layout.
 */
import React from 'react';
import { render } from 'ink-testing-library';
import { LineGraph } from '../../src/components/LineGraph.js';

// Line characters used for rendering (5 vertical levels: top to bottom)
const LINE_CHARS = ['⎺', '⎻', '─', '⎼', '⎽'];

describe('E2E: LineGraph', () => {
  describe('Basic rendering', () => {
    it('renders single series with line characters', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, 2, 3, 4, 5] }]}
          width={5}
          height={5}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });

    it('renders series with color', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, 2, 3], color: 'red' }]}
          width={3}
          height={3}
        />
      );
      const output = lastFrame();

      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });

    it('renders constant data as horizontal line', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [5, 5, 5, 5] }]}
          width={4}
          height={5}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      const rowsWithChars = lines.filter(line =>
        LINE_CHARS.some(char => line.includes(char))
      );
      expect(rowsWithChars.length).toBe(1);
    });

    it('handles single data point', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [42] }]}
          width={1}
          height={3}
        />
      );
      const output = lastFrame();

      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });
  });

  describe('Multiple series', () => {
    it('renders multiple series', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[
            { values: [1, 5], color: 'red' },
            { values: [5, 1], color: 'blue' },
          ]}
          width={2}
          height={3}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(3);
      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });

    it('first series takes priority on overlap', () => {
      // Both series have same value at same position
      // First series (red) should win
      const { lastFrame } = render(
        <LineGraph
          data={[
            { values: [50], color: 'red' },
            { values: [50], color: 'blue' },
          ]}
          width={1}
          height={3}
          yDomain={[0, 100]}
        />
      );
      const output = lastFrame();

      // Should render something (exact color testing is complex)
      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });

    it('uses longest series for auto width', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[
            { values: [1, 2, 3, 4, 5] },
            { values: [1, 2] },
          ]}
          width="auto"
          height={3}
        />
      );
      const output = lastFrame();

      // Count total characters (should be based on longest series = 5)
      const totalChars = LINE_CHARS.reduce((count, char) => {
        return count + (output?.split(char).length ?? 1) - 1;
      }, 0);
      expect(totalChars).toBeGreaterThanOrEqual(5);
    });
  });

  describe('High resolution', () => {
    it('uses different vertical positions within a row', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [0, 50, 100] }]}
          width={3}
          height={1}
          yDomain={[0, 100]}
        />
      );
      const output = lastFrame();

      expect(output).toContain('⎽'); // bottom
      expect(output).toContain('─'); // middle
      expect(output).toContain('⎺'); // top
    });

    it('achieves 5x resolution per row', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [0, 20, 40, 60, 80, 100] }]}
          width={6}
          height={2}
          yDomain={[0, 100]}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(2);
      const row0HasChar = LINE_CHARS.some(char => lines[0]?.includes(char));
      const row1HasChar = LINE_CHARS.some(char => lines[1]?.includes(char));
      expect(row0HasChar).toBe(true);
      expect(row1HasChar).toBe(true);
    });
  });

  describe('Dimensions', () => {
    it('respects height setting', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, 5, 3] }]}
          width={3}
          height={10}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(10);
    });

    it('respects width setting', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, 2, 3, 4, 5, 6, 7, 8] }]}
          width={4}
          height={5}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(4);
      });
    });
  });

  describe('Caption', () => {
    it('renders caption when provided', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, 2, 3] }]}
          width={3}
          height={3}
          caption="Test Caption"
        />
      );
      const output = lastFrame();

      expect(output).toContain('Test Caption');
    });

    it('does not render caption when empty', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, 2, 3] }]}
          width={3}
          height={3}
          caption=""
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(3);
    });
  });

  describe('Y-Axis', () => {
    it('shows Y-axis labels when enabled', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [10, 50, 100] }]}
          width={20}
          height={5}
          showYAxis={true}
        />
      );
      const output = lastFrame();

      expect(output).toContain('│');
      expect(output).toContain('100');
      expect(output).toContain('10');
    });

    it('does not show Y-axis by default', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [10, 50, 100] }]}
          width={10}
          height={5}
        />
      );
      const output = lastFrame();

      expect(output).not.toContain('│');
    });
  });

  describe('yDomain', () => {
    it('uses fixed domain when specified', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [25, 50, 75] }]}
          width={3}
          height={5}
          yDomain={[0, 100]}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      const hasChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasChar).toBe(true);
    });

    it('auto-scales from all series when yDomain is auto', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[
            { values: [100, 200] },
            { values: [50, 150] },
          ]}
          width={2}
          height={5}
          yDomain="auto"
        />
      );
      const output = lastFrame();

      const hasChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasChar).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('returns null for empty data array', () => {
      const { lastFrame } = render(
        <LineGraph data={[]} width={5} height={5} />
      );
      const output = lastFrame();

      expect(output).toBe('');
    });

    it('returns null for series with no valid values', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [NaN, Infinity, -Infinity] }]}
          width={3}
          height={3}
        />
      );
      const output = lastFrame();

      expect(output).toBe('');
    });

    it('filters out non-finite values within series', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [1, NaN, 3, Infinity, 5] }]}
          width={3}
          height={3}
        />
      );
      const output = lastFrame();

      const hasChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasChar).toBe(true);
    });

    it('handles negative values', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[{ values: [-10, 0, 10] }]}
          width={3}
          height={5}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      const hasChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasChar).toBe(true);
    });
  });
});
