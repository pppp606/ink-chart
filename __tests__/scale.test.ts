import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, quantize } from '../src/scale.js';

describe('scale functions', () => {
  describe('normalize', () => {
    it('should normalize [0, 10] range so that 0→0 and 10→1', () => {
      const normalizer = normalize([0, 10]);
      assert.equal(normalizer(0), 0);
      assert.equal(normalizer(10), 1);
      assert.equal(normalizer(5), 0.5);
    });

    it('should handle negative ranges', () => {
      const normalizer = normalize([-10, 10]);
      assert.equal(normalizer(-10), 0);
      assert.equal(normalizer(10), 1);
      assert.equal(normalizer(0), 0.5);
    });

    it('should handle single value ranges by returning 0', () => {
      const normalizer = normalize([5, 5]);
      assert.equal(normalizer(5), 0);
      assert.equal(normalizer(3), 0);
      assert.equal(normalizer(7), 0);
    });

    it('should handle empty arrays by treating as [0, 0]', () => {
      const normalizer = normalize([]);
      assert.equal(normalizer(0), 0);
      assert.equal(normalizer(5), 0);
    });

    it('should preserve monotonicity', () => {
      const normalizer = normalize([0, 100]);
      assert.ok(normalizer(10) < normalizer(20));
      assert.ok(normalizer(20) < normalizer(30));
    });

    it('should handle values outside the range', () => {
      const normalizer = normalize([0, 10]);
      assert.equal(normalizer(-5), -0.5);
      assert.equal(normalizer(15), 1.5);
    });
  });

  describe('quantize', () => {
    it('should produce monotonic sequence for quantize(0..1, n=8)', () => {
      const quantizer = quantize([0, 1], 8);
      assert.equal(quantizer(0), 0);
      assert.equal(quantizer(1), 7);
      assert.equal(quantizer(0.5), 4);
      
      // Test monotonicity
      for (let i = 0; i <= 1; i += 0.1) {
        for (let j = i + 0.1; j <= 1; j += 0.1) {
          assert.ok(quantizer(i) <= quantizer(j));
        }
      }
    });

    it('should handle boundary values correctly', () => {
      const quantizer = quantize([0, 10], 4);
      assert.equal(quantizer(0), 0);
      assert.equal(quantizer(10), 3);
      assert.equal(quantizer(2.5), 1);
      assert.equal(quantizer(7.5), 3);
    });

    it('should work with different quantization levels', () => {
      const quantizer4 = quantize([0, 100], 4);
      const quantizer8 = quantize([0, 100], 8);
      const quantizer16 = quantize([0, 100], 16);
      
      assert.equal(quantizer4(50), 2);
      assert.equal(quantizer8(50), 4);
      assert.equal(quantizer16(50), 8);
    });

    it('should handle out-of-range values gracefully', () => {
      const quantizer = quantize([0, 10], 8);
      assert.equal(quantizer(-5), -4);
      assert.equal(quantizer(15), 12);
    });

    it('should handle edge case of n=1', () => {
      const quantizer = quantize([0, 10], 1);
      assert.equal(quantizer(0), 0);
      assert.equal(quantizer(5), 0);
      assert.equal(quantizer(10), 0);
    });
  });
});