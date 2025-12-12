/**
 * E2E Tests for LineGraph Component
 *
 * These tests use ink-testing-library to capture actual terminal output
 * and verify the rendered characters and layout.
 */
import React from 'react';
import { render } from 'ink-testing-library';
import { LineGraph } from '../../src/components/LineGraph.js';

// Line characters used for rendering (top, middle, bottom)
const LINE_CHARS = ['‾', '─', '_'];

describe('E2E: LineGraph', () => {
  describe('Basic rendering', () => {
    it('renders data with line characters', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3, 4, 5]} width={5} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      // Check that at least one line character appears
      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });

    it('renders ascending data correctly', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 5]} width={2} height={3} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(3);
      // Highest value (5) should be in top row
      const topHasChar = LINE_CHARS.some(char => lines[0]?.includes(char));
      expect(topHasChar).toBe(true);
    });

    it('renders constant data as horizontal line', () => {
      const { lastFrame } = render(
        <LineGraph data={[5, 5, 5, 5]} width={4} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      // All characters should be on the same row (middle area)
      const rowsWithChars = lines.filter(line =>
        LINE_CHARS.some(char => line.includes(char))
      );
      expect(rowsWithChars.length).toBe(1);
    });

    it('handles single data point', () => {
      const { lastFrame } = render(
        <LineGraph data={[42]} width={1} height={3} />
      );
      const output = lastFrame();

      const hasLineChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasLineChar).toBe(true);
    });
  });

  describe('High resolution', () => {
    it('uses different vertical positions within a row', () => {
      // With height=1 and 3 data points at different values,
      // we should see different characters (top/middle/bottom)
      const { lastFrame } = render(
        <LineGraph data={[0, 50, 100]} width={3} height={1} yDomain={[0, 100]} />
      );
      const output = lastFrame();

      // Should have characters at different vertical positions
      // 0 -> bottom (_), 50 -> middle (─), 100 -> top (‾)
      expect(output).toContain('_');
      expect(output).toContain('─');
      expect(output).toContain('‾');
    });

    it('achieves 3x resolution per row', () => {
      // height=2 should give 6 distinct levels
      const { lastFrame } = render(
        <LineGraph
          data={[0, 20, 40, 60, 80, 100]}
          width={6}
          height={2}
          yDomain={[0, 100]}
        />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(2);
      // Both rows should have characters
      const row0HasChar = LINE_CHARS.some(char => lines[0]?.includes(char));
      const row1HasChar = LINE_CHARS.some(char => lines[1]?.includes(char));
      expect(row0HasChar).toBe(true);
      expect(row1HasChar).toBe(true);
    });
  });

  describe('Dimensions', () => {
    it('respects height setting', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 5, 3]} width={3} height={10} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(10);
    });

    it('respects width setting', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3, 4, 5, 6, 7, 8]} width={4} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      // Each line should be at most 4 characters wide
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(4);
      });
    });

    it('interpolates data when width > data length', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 5]} width={10} height={5} />
      );
      const output = lastFrame();

      // Count total graph characters
      const totalChars = LINE_CHARS.reduce((count, char) => {
        return count + (output?.split(char).length ?? 1) - 1;
      }, 0);
      expect(totalChars).toBe(10);
    });
  });

  describe('Caption', () => {
    it('renders caption when provided', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3]} width={3} height={3} caption="Test Caption" />
      );
      const output = lastFrame();

      expect(output).toContain('Test Caption');
    });

    it('does not render caption when empty', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3]} width={3} height={3} caption="" />
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
          data={[10, 50, 100]}
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
        <LineGraph data={[10, 50, 100]} width={10} height={5} />
      );
      const output = lastFrame();

      expect(output).not.toContain('│');
    });
  });

  describe('yDomain', () => {
    it('uses fixed domain when specified', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[25, 50, 75]}
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

    it('auto-scales when yDomain is auto', () => {
      const { lastFrame } = render(
        <LineGraph
          data={[100, 200, 150]}
          width={3}
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
    it('returns null for empty data', () => {
      const { lastFrame } = render(
        <LineGraph data={[]} width={5} height={5} />
      );
      const output = lastFrame();

      expect(output).toBe('');
    });

    it('filters out non-finite values', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, NaN, 3, Infinity, 5]} width={3} height={3} />
      );
      const output = lastFrame();

      const hasChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasChar).toBe(true);
    });

    it('handles negative values', () => {
      const { lastFrame } = render(
        <LineGraph data={[-10, 0, 10]} width={3} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      const hasChar = LINE_CHARS.some(char => output?.includes(char));
      expect(hasChar).toBe(true);
    });
  });
});
