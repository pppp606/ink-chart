import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToFrame } from './helpers/renderToFrame.js';
import { BarChart, BarChartData } from '../src/components/BarChart.js';

describe('BarChart Component', () => {
  // Render the component through Ink and return the frame (null when nothing is rendered)
  const executeComponent = (props: any) => renderToFrame(BarChart, props);

  it('should execute with basic data', () => {
    const data: BarChartData[] = [{ label: 'Test', value: 10 }];
    const result = executeComponent({ data });
    assert.notEqual(result, null);
  });

  it('should return null for empty data', () => {
    const result = executeComponent({ data: [] });
    assert.equal(result, null);
  });

  it('should execute sorting functions', () => {
    const data: BarChartData[] = [
      { label: 'B', value: 10 },
      { label: 'A', value: 20 },
      { label: 'C', value: 15 }
    ];
    
    const descResult = executeComponent({ data, sort: 'desc' });
    const ascResult = executeComponent({ data, sort: 'asc' });
    const noneResult = executeComponent({ data, sort: 'none' });
    
    assert.notEqual(descResult, null);
    assert.notEqual(ascResult, null);
    assert.notEqual(noneResult, null);
  });

  it('should execute width calculations', () => {
    const data: BarChartData[] = [{ label: 'Test', value: 50 }];
    
    const autoResult = executeComponent({ data, width: 'auto' });
    const fullResult = executeComponent({ data, width: 'full' });
    const fixedResult = executeComponent({ data, width: 50 });
    
    assert.notEqual(autoResult, null);
    assert.notEqual(fullResult, null);
    assert.notEqual(fixedResult, null);
  });

  it('should execute value display options', () => {
    const data: BarChartData[] = [{ label: 'Item', value: 42 }];
    
    const rightResult = executeComponent({ data, showValue: 'right' });
    const noneResult = executeComponent({ data, showValue: 'none' });
    
    assert.notEqual(rightResult, null);
    assert.notEqual(noneResult, null);
  });

  it('should execute max value calculations', () => {
    const data: BarChartData[] = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ];
    
    const autoResult = executeComponent({ data, max: 'auto' });
    const fixedResult = executeComponent({ data, max: 100 });
    
    assert.notEqual(autoResult, null);
    assert.notEqual(fixedResult, null);
  });

  it('should execute bar character options', () => {
    const data: BarChartData[] = [{ label: 'Test', value: 25 }];
    
    const chars = ['▆', '█', '▓', '▒', '░'];
    chars.forEach(barChar => {
      const result = executeComponent({ data, barChar });
      assert.notEqual(result, null);
    });
  });

  it('should execute color options', () => {
    const data: BarChartData[] = [
      { label: 'Colored', value: 30, color: '#ff0000' },
      { label: 'Default', value: 40 }
    ];
    
    const colorResult = executeComponent({ data, color: '#00ff00' });
    const noColorResult = executeComponent({ data });
    
    assert.notEqual(colorResult, null);
    assert.notEqual(noColorResult, null);
  });

  it('should execute format function', () => {
    const data: BarChartData[] = [{ label: 'Sales', value: 1000 }];
    
    const formatResult = executeComponent({ 
      data, 
      showValue: 'right',
      format: (v: number) => `$${v}K` 
    });
    
    assert.notEqual(formatResult, null);
  });

  it('should handle zero maxValue edge case', () => {
    const data: BarChartData[] = [{ label: 'Zero', value: 0 }];
    const result = executeComponent({ data });
    assert.equal(result, null);
  });

  it('should execute complex combinations', () => {
    const data: BarChartData[] = [
      { label: 'Success', value: 85.5, color: '#4CAF50' },
      { label: 'Warning', value: 12.3, color: '#FF9800' },
      { label: 'Error', value: 2.2, color: '#F44336' }
    ];
    
    const result = executeComponent({ 
      data, 
      sort: 'desc', 
      showValue: 'right', 
      format: (v: number) => `${v.toFixed(1)}%`,
      barChar: '▓',
      width: 60,
      max: 100,
      color: '#333333'
    });
    
    assert.notEqual(result, null);
  });
});