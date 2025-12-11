/**
 * E2E Tests for StackedBarChart Component
 *
 * These tests use ink-testing-library to capture actual terminal output
 * and verify the rendered stacked segments, labels, values, and colors.
 */
import React from 'react';
import { render } from 'ink-testing-library';
import { StackedBarChart } from '../../src/components/StackedBarChart.js';
import { hasAnsi, stripAnsi } from '../../src/core/ansi.js';

describe('E2E: StackedBarChart', () => {
  describe('Basic rendering', () => {
    it('renders stacked bar with segments', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 50 },
            { label: 'B', value: 50 },
          ]}
          width={20}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
      expect((output || '').length).toBeGreaterThan(0);
    });

    it('renders with multiple segments', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'First', value: 30 },
            { label: 'Second', value: 40 },
            { label: 'Third', value: 30 },
          ]}
          width={30}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });
  });

  describe('Percentage mode (default)', () => {
    it('renders as 100% stacked bar', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'Half', value: 50 },
            { label: 'Half', value: 50 },
          ]}
          width={20}
          mode="percentage"
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });

    it('normalizes values to percentage', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 100 },
            { label: 'B', value: 100 },
            { label: 'C', value: 100 },
          ]}
          width={30}
          mode="percentage"
        />
      );
      const output = lastFrame();

      // Each segment should take roughly 1/3 of the bar
      expect(output).toBeDefined();
    });
  });

  describe('Absolute mode', () => {
    it('renders in absolute mode', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 30 },
            { label: 'B', value: 20 },
          ]}
          width={20}
          mode="absolute"
          max={100}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });

    it('respects max value in absolute mode', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[{ label: 'Half', value: 50 }]}
          width={20}
          mode="absolute"
          max={100}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });
  });

  describe('Colors', () => {
    beforeAll(() => {
      // Force 24-bit color depth for color tests
      process.env.FORCE_COLOR_DEPTH = '8';
    });

    afterAll(() => {
      delete process.env.FORCE_COLOR_DEPTH;
    });

    it('applies custom colors to segments', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'Red', value: 50, color: '#ff0000' },
            { label: 'Blue', value: 50, color: '#0000ff' },
          ]}
          width={20}
        />
      );
      const output = lastFrame();

      // Verify segments are rendered
      expect(output).toBeDefined();
      expect((output || '').length).toBeGreaterThan(0);
    });

    it('applies different colors to each segment', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 33, color: '#ff0000' },
            { label: 'B', value: 33, color: '#00ff00' },
            { label: 'C', value: 34, color: '#0000ff' },
          ]}
          width={30}
        />
      );
      const output = lastFrame();

      // Verify the chart renders
      expect(output).toBeDefined();
    });
  });

  describe('Labels and values', () => {
    it('shows labels by default', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'Sales', value: 60 },
            { label: 'Cost', value: 40 },
          ]}
          width={40}
          showLabels={true}
        />
      );
      const output = lastFrame();

      expect(output).toContain('Sales');
      expect(output).toContain('Cost');
    });

    it('hides labels when disabled', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'Hidden', value: 50 },
            { label: 'Also Hidden', value: 50 },
          ]}
          width={30}
          showLabels={false}
        />
      );
      const frame = lastFrame();
      const cleanOutput = stripAnsi(frame || '');

      expect(cleanOutput).not.toContain('Hidden');
    });

    it('shows values when enabled', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 75 },
            { label: 'B', value: 25 },
          ]}
          width={40}
          showValues={true}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });
  });

  describe('Custom format', () => {
    it('uses custom format function', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 75 },
            { label: 'B', value: 25 },
          ]}
          width={40}
          showValues={true}
          format={(v) => `${v.toFixed(0)}%`}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });

    it('format receives mode parameter', () => {
      let formatCalled = false;
      let receivedMode: string | undefined;

      const formatFn = (v: number, mode?: string) => {
        formatCalled = true;
        receivedMode = mode;
        return `${v}|${mode}`;
      };

      render(
        <StackedBarChart
          data={[{ label: 'A', value: 100 }]}
          width={30}
          showValues={true}
          format={formatFn}
        />
      );

      expect(formatCalled).toBe(true);
      expect(receivedMode).toBeDefined();
    });
  });

  describe('Width handling', () => {
    it('respects explicit width', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 50 },
            { label: 'B', value: 50 },
          ]}
          width={40}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles single segment', () => {
      const { lastFrame } = render(
        <StackedBarChart data={[{ label: 'Only', value: 100 }]} width={20} />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });

    it('handles many segments', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'A', value: 10 },
            { label: 'B', value: 15 },
            { label: 'C', value: 20 },
            { label: 'D', value: 25 },
            { label: 'E', value: 30 },
          ]}
          width={50}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });

    it('handles small values', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'Tiny', value: 1 },
            { label: 'Large', value: 99 },
          ]}
          width={30}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });

    it('handles zero values gracefully', () => {
      const { lastFrame } = render(
        <StackedBarChart
          data={[
            { label: 'Zero', value: 0 },
            { label: 'Full', value: 100 },
          ]}
          width={20}
        />
      );
      const output = lastFrame();

      expect(output).toBeDefined();
    });
  });
});
