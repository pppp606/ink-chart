import { calculateLayout } from '../src/barchart.layout';

describe('barchart layout functions', () => {
  describe('calculateLayout', () => {
    it('should allocate width correctly: label + bar + value = total width', () => {
      const result = calculateLayout({
        totalWidth: 20,
        labelWidth: 6,
        valueWidth: 4,
        minBarWidth: 2
      });
      
      expect(result.labelWidth).toBe(6);
      expect(result.valueWidth).toBe(4);
      expect(result.barWidth).toBe(10); // 20 - 6 - 4 = 10
      expect(result.labelWidth + result.barWidth + result.valueWidth).toBe(20);
    });

    it('should ensure non-negative width guarantees', () => {
      const result = calculateLayout({
        totalWidth: 10,
        labelWidth: 12, // Exceeds total width
        valueWidth: 3,
        minBarWidth: 1
      });
      
      expect(result.labelWidth).toBeGreaterThanOrEqual(0);
      expect(result.barWidth).toBeGreaterThanOrEqual(1); // Should respect minBarWidth
      expect(result.valueWidth).toBeGreaterThanOrEqual(0);
      expect(result.labelWidth + result.barWidth + result.valueWidth).toBeLessThanOrEqual(10);
    });

    it('should respect minimum bar width requirement', () => {
      const result = calculateLayout({
        totalWidth: 8,
        labelWidth: 4,
        valueWidth: 4,
        minBarWidth: 3
      });
      
      expect(result.barWidth).toBeGreaterThanOrEqual(3);
      expect(result.labelWidth + result.barWidth + result.valueWidth).toBeLessThanOrEqual(8);
    });

    it('should handle case when content exceeds available width gracefully', () => {
      const result = calculateLayout({
        totalWidth: 5,
        labelWidth: 10,
        valueWidth: 8,
        minBarWidth: 2
      });
      
      // Should still produce valid layout
      expect(result.labelWidth).toBeGreaterThanOrEqual(0);
      expect(result.barWidth).toBeGreaterThanOrEqual(2);
      expect(result.valueWidth).toBeGreaterThanOrEqual(0);
      expect(result.labelWidth + result.barWidth + result.valueWidth).toBeLessThanOrEqual(5);
    });

    it('should prioritize bar width over label and value when space is tight', () => {
      const result = calculateLayout({
        totalWidth: 10,
        labelWidth: 8,
        valueWidth: 6,
        minBarWidth: 4
      });
      
      // Bar should get its minimum, then remaining space allocated to label/value
      expect(result.barWidth).toBe(4);
      expect(result.labelWidth + result.valueWidth).toBe(6); // 10 - 4 = 6
      expect(result.labelWidth).toBeGreaterThan(0);
      expect(result.valueWidth).toBeGreaterThan(0);
    });

    it('should provide consistent behavior across different data sets', () => {
      const layouts = [
        calculateLayout({ totalWidth: 30, labelWidth: 8, valueWidth: 6, minBarWidth: 3 }),
        calculateLayout({ totalWidth: 30, labelWidth: 10, valueWidth: 4, minBarWidth: 3 }),
        calculateLayout({ totalWidth: 30, labelWidth: 5, valueWidth: 8, minBarWidth: 3 })
      ];
      
      // All should use full width
      layouts.forEach(layout => {
        expect(layout.labelWidth + layout.barWidth + layout.valueWidth).toBe(30);
        expect(layout.barWidth).toBeGreaterThanOrEqual(3);
      });
      
      // Bar widths should be reasonable (more space = bigger bars)
      expect(layouts[0].barWidth).toBe(16); // 30 - 8 - 6 = 16
      expect(layouts[1].barWidth).toBe(16); // 30 - 10 - 4 = 16
      expect(layouts[2].barWidth).toBe(17); // 30 - 5 - 8 = 17
    });

    it('should handle edge case of very small total width', () => {
      const result = calculateLayout({
        totalWidth: 3,
        labelWidth: 5,
        valueWidth: 5,
        minBarWidth: 1
      });
      
      expect(result.labelWidth + result.barWidth + result.valueWidth).toBeLessThanOrEqual(3);
      expect(result.barWidth).toBeGreaterThanOrEqual(1);
    });

    it('should handle zero and negative inputs gracefully', () => {
      const result = calculateLayout({
        totalWidth: 0,
        labelWidth: 0,
        valueWidth: 0,
        minBarWidth: 1
      });
      
      expect(result.labelWidth).toBe(0);
      expect(result.barWidth).toBe(0); // Can't satisfy minBarWidth with 0 total width
      expect(result.valueWidth).toBe(0);
    });

    it('should allocate remaining space proportionally when possible', () => {
      const result = calculateLayout({
        totalWidth: 24,
        labelWidth: 6, // Requested
        valueWidth: 4, // Requested
        minBarWidth: 8  // Minimum
      });
      
      // Should get: label=6, value=4, bar=14 (24-6-4=14, which is > minBarWidth=8)
      expect(result.labelWidth).toBe(6);
      expect(result.valueWidth).toBe(4);
      expect(result.barWidth).toBe(14);
    });

    it('should scale down label and value proportionally when bar needs more space', () => {
      const result = calculateLayout({
        totalWidth: 12,
        labelWidth: 8, // 8+6=14 total requested for label+value  
        valueWidth: 6,
        minBarWidth: 5 // Needs 5, leaving 7 for label+value
      });
      
      expect(result.barWidth).toBe(5);
      expect(result.labelWidth + result.valueWidth).toBe(7);
      
      // Should scale proportionally: 8:6 ratio maintained roughly
      // 7 * (8/14) ≈ 4, 7 * (6/14) ≈ 3
      expect(result.labelWidth).toBeCloseTo(4, 0);
      expect(result.valueWidth).toBeCloseTo(3, 0);
    });
  });
});