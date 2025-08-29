import { normalize, quantize } from '../src/scale';

describe('scale functions', () => {
  describe('normalize', () => {
    it('should normalize [0, 10] range so that 0→0 and 10→1', () => {
      const normalizer = normalize([0, 10]);
      expect(normalizer(0)).toBe(0);
      expect(normalizer(10)).toBe(1);
      expect(normalizer(5)).toBe(0.5);
    });

    it('should handle negative ranges', () => {
      const normalizer = normalize([-10, 10]);
      expect(normalizer(-10)).toBe(0);
      expect(normalizer(10)).toBe(1);
      expect(normalizer(0)).toBe(0.5);
    });

    it('should handle single value ranges by returning 0', () => {
      const normalizer = normalize([5, 5]);
      expect(normalizer(5)).toBe(0);
      expect(normalizer(3)).toBe(0);
      expect(normalizer(7)).toBe(0);
    });

    it('should handle empty arrays by treating as [0, 0]', () => {
      const normalizer = normalize([]);
      expect(normalizer(0)).toBe(0);
      expect(normalizer(5)).toBe(0);
    });

    it('should preserve monotonicity', () => {
      const normalizer = normalize([0, 100]);
      expect(normalizer(10)).toBeLessThan(normalizer(20));
      expect(normalizer(20)).toBeLessThan(normalizer(30));
    });

    it('should handle values outside the range', () => {
      const normalizer = normalize([0, 10]);
      expect(normalizer(-5)).toBe(-0.5);
      expect(normalizer(15)).toBe(1.5);
    });
  });

  describe('quantize', () => {
    it('should produce monotonic sequence for quantize(0..1, n=8)', () => {
      const quantizer = quantize([0, 1], 8);
      expect(quantizer(0)).toBe(0);
      expect(quantizer(1)).toBe(7);
      expect(quantizer(0.5)).toBe(4);
      
      // Test monotonicity
      for (let i = 0; i <= 1; i += 0.1) {
        for (let j = i + 0.1; j <= 1; j += 0.1) {
          expect(quantizer(i)).toBeLessThanOrEqual(quantizer(j));
        }
      }
    });

    it('should handle boundary values correctly', () => {
      const quantizer = quantize([0, 10], 4);
      expect(quantizer(0)).toBe(0);
      expect(quantizer(10)).toBe(3);
      expect(quantizer(2.5)).toBe(1);
      expect(quantizer(7.5)).toBe(3);
    });

    it('should work with different quantization levels', () => {
      const quantizer4 = quantize([0, 100], 4);
      const quantizer8 = quantize([0, 100], 8);
      const quantizer16 = quantize([0, 100], 16);
      
      expect(quantizer4(50)).toBe(2);
      expect(quantizer8(50)).toBe(4);
      expect(quantizer16(50)).toBe(8);
    });

    it('should handle out-of-range values gracefully', () => {
      const quantizer = quantize([0, 10], 8);
      expect(quantizer(-5)).toBe(-4);
      expect(quantizer(15)).toBe(12);
    });

    it('should handle edge case of n=1', () => {
      const quantizer = quantize([0, 10], 1);
      expect(quantizer(0)).toBe(0);
      expect(quantizer(5)).toBe(0);
      expect(quantizer(10)).toBe(0);
    });
  });
});