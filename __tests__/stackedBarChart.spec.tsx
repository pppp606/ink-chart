import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToFrame } from './helpers/renderToFrame.js';
import { StackedBarChart, StackedBarSegment } from '../src/components/StackedBarChart.js';

describe('StackedBarChart Component', () => {
  // Render the component through Ink and return the frame (null when nothing is rendered)
  const executeComponent = (props: any) => renderToFrame(StackedBarChart, props);

  it('should execute with basic data', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];
    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should return null for empty data', () => {
    const result = executeComponent({ data: [] });
    assert.equal(result, null);
  });

  it('should return null for null data', () => {
    const result = executeComponent({ data: null });
    assert.equal(result, null);
  });

  it('should return null for zero total value', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 }
    ];
    const result = executeComponent({ data });
    assert.equal(result, null);
  });

  it('should handle negative values by treating them as zero', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: -10 },
      { label: 'B', value: 50 }
    ];
    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should execute width calculations', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const autoResult = executeComponent({ data, width: 'auto' });
    const fullResult = executeComponent({ data, width: 'full' });
    const fixedResult = executeComponent({ data, width: 50 });

    assert.notEqual(autoResult, null);
    assert.notEqual(fullResult, null);
    assert.notEqual(fixedResult, null);
  });

  it('should execute with showLabels options', () => {
    const data: StackedBarSegment[] = [
      { label: 'Test', value: 50 }
    ];

    const withLabels = executeComponent({ data, showLabels: true });
    const withoutLabels = executeComponent({ data, showLabels: false });

    assert.notEqual(withLabels, null);
    assert.notEqual(withoutLabels, null);
  });

  it('should execute with showValues options', () => {
    const data: StackedBarSegment[] = [
      { label: 'Test', value: 50 }
    ];

    const withValues = executeComponent({ data, showValues: true });
    const withoutValues = executeComponent({ data, showValues: false });

    assert.notEqual(withValues, null);
    assert.notEqual(withoutValues, null);
  });

  it('should execute with custom format function', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 25 },
      { label: 'B', value: 75 }
    ];

    const customFormat = (v: number) => `${v.toFixed(0)}%`;
    const result = executeComponent({ data, format: customFormat });

    assert.notEqual(result, null);
  });

  it('should execute with color options', () => {
    const data: StackedBarSegment[] = [
      { label: 'Success', value: 30, color: '#4aaa1a' },
      { label: 'Warning', value: 20, color: '#d89612' },
      { label: 'Error', value: 50, color: '#a61d24' }
    ];

    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should execute with custom characters', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 50, char: '█' },
      { label: 'B', value: 50, char: '▒' }
    ];

    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should execute with multiple segments', () => {
    const data: StackedBarSegment[] = [
      { label: 'Q1', value: 25 },
      { label: 'Q2', value: 25 },
      { label: 'Q3', value: 25 },
      { label: 'Q4', value: 25 }
    ];

    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should execute with unequal segment values', () => {
    const data: StackedBarSegment[] = [
      { label: 'Small', value: 5 },
      { label: 'Medium', value: 15 },
      { label: 'Large', value: 80 }
    ];

    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should execute with single segment', () => {
    const data: StackedBarSegment[] = [
      { label: 'Only', value: 100 }
    ];

    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should execute with very small width', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const result = executeComponent({ data, width: 10 });
    assert.notEqual(result, null);
  });

  it('should execute with large width', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const result = executeComponent({ data, width: 200 });
    assert.notEqual(result, null);
  });

  it('should execute with all options combined', () => {
    const data: StackedBarSegment[] = [
      { label: 'Sales', value: 30, color: '#4aaa1a', char: '█' },
      { label: 'Marketing', value: 20, color: '#d89612', char: '▓' },
      { label: 'Support', value: 50, color: '#a61d24', char: '▒' }
    ];

    const result = executeComponent({
      data,
      width: 60,
      showLabels: true,
      showValues: true,
      format: (v: number) => `${v.toFixed(1)}%`
    });

    assert.notEqual(result, null);
  });

  // Absolute mode tests
  it('should execute with absolute mode', () => {
    const data: StackedBarSegment[] = [
      { label: 'Complete', value: 75 },
      { label: 'In Progress', value: 25 }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      max: 200
    });

    assert.notEqual(result, null);
  });

  it('should execute with absolute mode and auto max', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      max: 'auto'
    });

    assert.notEqual(result, null);
  });

  it('should execute with absolute mode and custom format', () => {
    const data: StackedBarSegment[] = [
      { label: 'Downloads', value: 1250 },
      { label: 'Uploads', value: 450 }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      max: 5000,
      format: (v: number, mode: string) =>
        mode === 'percentage' ? `${v.toFixed(1)}%` : `${v}`
    });

    assert.notEqual(result, null);
  });

  it('should execute with percentage mode explicitly', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 40 },
      { label: 'B', value: 60 }
    ];

    const result = executeComponent({
      data,
      mode: 'percentage'
    });

    assert.notEqual(result, null);
  });

  it('should execute with absolute mode showing labels and values', () => {
    const data: StackedBarSegment[] = [
      { label: 'CPU', value: 45 },
      { label: 'Memory', value: 30 },
      { label: 'Disk', value: 25 }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      max: 100,
      showLabels: true,
      showValues: true,
      width: 50
    });

    assert.notEqual(result, null);
  });

  it('should execute with absolute mode without labels', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      showLabels: false,
      max: 200
    });

    assert.notEqual(result, null);
  });

  it('should execute with absolute mode without values', () => {
    const data: StackedBarSegment[] = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      showValues: false,
      max: 200
    });

    assert.notEqual(result, null);
  });

  it('should execute with absolute mode and colors', () => {
    const data: StackedBarSegment[] = [
      { label: 'Success', value: 150, color: '#4aaa1a' },
      { label: 'Warning', value: 50, color: '#d89612' },
      { label: 'Error', value: 20, color: '#a61d24' }
    ];

    const result = executeComponent({
      data,
      mode: 'absolute',
      max: 300
    });

    assert.notEqual(result, null);
  });
});
