import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLayout } from '../src/barChartLayout.js';

describe('barchart layout functions', () => {
  describe('calculateLayout', () => {
    it('should allocate width correctly: label + bar + value = total width', () => {
      const result = calculateLayout({
        totalWidth: 20,
        labelWidth: 6,
        valueWidth: 4,
        minBarWidth: 2
      });
      
      assert.equal(result.labelWidth, 6);
      assert.equal(result.valueWidth, 4);
      assert.equal(result.barWidth, 10); // 20 - 6 - 4 = 10
      assert.equal(result.labelWidth + result.barWidth + result.valueWidth, 20);
    });

    it('should ensure non-negative width guarantees', () => {
      const result = calculateLayout({
        totalWidth: 10,
        labelWidth: 12, // Exceeds total width
        valueWidth: 3,
        minBarWidth: 1
      });
      
      assert.ok(result.labelWidth >= 0);
      assert.ok(result.barWidth >= 1); // Should respect minBarWidth
      assert.ok(result.valueWidth >= 0);
      assert.ok(result.labelWidth + result.barWidth + result.valueWidth <= 10);
    });

    it('should respect minimum bar width requirement', () => {
      const result = calculateLayout({
        totalWidth: 8,
        labelWidth: 4,
        valueWidth: 4,
        minBarWidth: 3
      });
      
      assert.ok(result.barWidth >= 3);
      assert.ok(result.labelWidth + result.barWidth + result.valueWidth <= 8);
    });

    it('should handle case when content exceeds available width gracefully', () => {
      const result = calculateLayout({
        totalWidth: 5,
        labelWidth: 10,
        valueWidth: 8,
        minBarWidth: 2
      });
      
      // Should still produce valid layout
      assert.ok(result.labelWidth >= 0);
      assert.ok(result.barWidth >= 2);
      assert.ok(result.valueWidth >= 0);
      assert.ok(result.labelWidth + result.barWidth + result.valueWidth <= 5);
    });

    it('should prioritize bar width over label and value when space is tight', () => {
      const result = calculateLayout({
        totalWidth: 10,
        labelWidth: 8,
        valueWidth: 6,
        minBarWidth: 4
      });
      
      // Bar should get its minimum, then remaining space allocated to label/value
      assert.equal(result.barWidth, 4);
      assert.equal(result.labelWidth + result.valueWidth, 6); // 10 - 4 = 6
      assert.ok(result.labelWidth > 0);
      assert.ok(result.valueWidth > 0);
    });

    it('should provide consistent behavior across different data sets', () => {
      const layouts = [
        calculateLayout({ totalWidth: 30, labelWidth: 8, valueWidth: 6, minBarWidth: 3 }),
        calculateLayout({ totalWidth: 30, labelWidth: 10, valueWidth: 4, minBarWidth: 3 }),
        calculateLayout({ totalWidth: 30, labelWidth: 5, valueWidth: 8, minBarWidth: 3 })
      ];
      
      // All should use full width
      layouts.forEach(layout => {
        assert.equal(layout.labelWidth + layout.barWidth + layout.valueWidth, 30);
        assert.ok(layout.barWidth >= 3);
      });
      
      // Bar widths should be reasonable (more space = bigger bars)
      assert.equal(layouts[0]?.barWidth, 16); // 30 - 8 - 6 = 16
      assert.equal(layouts[1]?.barWidth, 16); // 30 - 10 - 4 = 16
      assert.equal(layouts[2]?.barWidth, 17); // 30 - 5 - 8 = 17
    });

    it('should handle edge case of very small total width', () => {
      const result = calculateLayout({
        totalWidth: 3,
        labelWidth: 5,
        valueWidth: 5,
        minBarWidth: 1
      });
      
      assert.ok(result.labelWidth + result.barWidth + result.valueWidth <= 3);
      assert.ok(result.barWidth >= 1);
    });

    it('should handle zero and negative inputs gracefully', () => {
      const result = calculateLayout({
        totalWidth: 0,
        labelWidth: 0,
        valueWidth: 0,
        minBarWidth: 1
      });
      
      assert.equal(result.labelWidth, 0);
      assert.equal(result.barWidth, 0); // Can't satisfy minBarWidth with 0 total width
      assert.equal(result.valueWidth, 0);
    });

    it('should allocate remaining space proportionally when possible', () => {
      const result = calculateLayout({
        totalWidth: 24,
        labelWidth: 6, // Requested
        valueWidth: 4, // Requested
        minBarWidth: 8  // Minimum
      });
      
      // Should get: label=6, value=4, bar=14 (24-6-4=14, which is > minBarWidth=8)
      assert.equal(result.labelWidth, 6);
      assert.equal(result.valueWidth, 4);
      assert.equal(result.barWidth, 14);
    });

    it('should scale down label and value proportionally when bar needs more space', () => {
      const result = calculateLayout({
        totalWidth: 12,
        labelWidth: 8, // 8+6=14 total requested for label+value  
        valueWidth: 6,
        minBarWidth: 5 // Needs 5, leaving 7 for label+value
      });
      
      assert.equal(result.barWidth, 5);
      assert.equal(result.labelWidth + result.valueWidth, 7);
      
      // Should scale proportionally: 8:6 ratio maintained roughly
      // 7 * (8/14) ≈ 4, 7 * (6/14) ≈ 3
      assert.ok(Math.abs(result.labelWidth - 4) < 10 ** -0 / 2);
      assert.ok(Math.abs(result.valueWidth - 3) < 10 ** -0 / 2);
    });
  });
});