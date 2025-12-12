/**
 * E2E Tests for LineGraph Component
 *
 * These tests use ink-testing-library to capture actual terminal output
 * and verify the rendered characters and layout.
 */
import React from 'react';
import { render } from 'ink-testing-library';
import { LineGraph } from '../../src/components/LineGraph.js';

describe('E2E: LineGraph', () => {
  describe('Basic rendering', () => {
    it('renders ascending data with dots', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3, 4, 5]} width={5} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      // Check that dots appear in the output
      expect(output).toContain('●');
    });

    it('renders descending data correctly', () => {
      const { lastFrame } = render(
        <LineGraph data={[5, 4, 3, 2, 1]} width={5} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      // First line should have a dot (highest value at start)
      expect(lines[0]).toContain('●');
      // Last line should have a dot (lowest value at end)
      expect(lines[4]).toContain('●');
    });

    it('renders constant data as horizontal line', () => {
      const { lastFrame } = render(
        <LineGraph data={[5, 5, 5, 5]} width={4} height={5} />
      );
      const output = lastFrame();

      // All dots should be on the same row (middle)
      const lines = output?.split('\n') || [];
      const dotLines = lines.filter(line => line.includes('●'));
      expect(dotLines.length).toBe(1);
      // The line with dots should have 4 dots
      expect(dotLines[0]?.match(/●/g)?.length).toBe(4);
    });

    it('handles single data point', () => {
      const { lastFrame } = render(
        <LineGraph data={[42]} width={1} height={3} />
      );
      const output = lastFrame();

      expect(output).toContain('●');
    });
  });

  describe('Dot characters', () => {
    it('uses filled circle by default', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3]} width={3} height={3} />
      );
      const output = lastFrame();

      expect(output).toContain('●');
    });

    it('uses empty circle when specified', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3]} width={3} height={3} dotChar="○" />
      );
      const output = lastFrame();

      expect(output).toContain('○');
      expect(output).not.toContain('●');
    });

    it('uses diamond when specified', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3]} width={3} height={3} dotChar="◆" />
      );
      const output = lastFrame();

      expect(output).toContain('◆');
    });

    it('uses asterisk when specified', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 2, 3]} width={3} height={3} dotChar="*" />
      );
      const output = lastFrame();

      expect(output).toContain('*');
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
      // (trailing spaces may be trimmed by the terminal)
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(4);
      });
      // Total dots should equal width
      const totalDots = lines.reduce((count, line) => {
        return count + (line.match(/●/g)?.length || 0);
      }, 0);
      expect(totalDots).toBe(4);
    });

    it('interpolates data when width > data length', () => {
      const { lastFrame } = render(
        <LineGraph data={[1, 5]} width={10} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      // Should have dots across the width
      const totalDots = lines.reduce((count, line) => {
        return count + (line.match(/●/g)?.length || 0);
      }, 0);
      expect(totalDots).toBe(10);
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

      // Should contain Y-axis separator
      expect(output).toContain('│');
      // Should show min and max values
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

      // With fixed domain, 25 should be in lower rows, 75 in upper rows
      expect(lines.length).toBe(5);
      expect(output).toContain('●');
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

      expect(output).toContain('●');
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

      // Should render with only valid data points
      expect(output).toContain('●');
    });

    it('handles negative values', () => {
      const { lastFrame } = render(
        <LineGraph data={[-10, 0, 10]} width={3} height={5} />
      );
      const output = lastFrame();
      const lines = output?.split('\n') || [];

      expect(lines.length).toBe(5);
      expect(output).toContain('●');
    });
  });
});
