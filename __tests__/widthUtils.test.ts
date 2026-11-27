import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEffectiveWidth, getSafeTerminalWidth, DEFAULT_TERMINAL_MARGIN, MIN_COMPONENT_WIDTH } from '../src/core/widthUtils.js';

describe('Width Utilities', () => {
  describe('calculateEffectiveWidth', () => {
    it('should return auto for auto width', () => {
      const result = calculateEffectiveWidth('auto', 80);
      assert.equal(result, 'auto');
    });

    it('should calculate full width with margin', () => {
      const result = calculateEffectiveWidth('full', 80);
      assert.equal(result, 80 - DEFAULT_TERMINAL_MARGIN);
    });

    it('should enforce minimum width for full mode', () => {
      const result = calculateEffectiveWidth('full', 8); // Very small terminal
      assert.equal(result, MIN_COMPONENT_WIDTH);
    });

    it('should return exact number for fixed width', () => {
      const result = calculateEffectiveWidth(50, 80);
      assert.equal(result, 50);
    });

    it('should handle zero terminal width', () => {
      const result = calculateEffectiveWidth('full', 0);
      assert.equal(result, MIN_COMPONENT_WIDTH);
    });

    it('should handle negative terminal width', () => {
      const result = calculateEffectiveWidth('full', -10);
      assert.equal(result, MIN_COMPONENT_WIDTH);
    });
  });

  describe('getSafeTerminalWidth', () => {
    it('should subtract default margin from valid columns', () => {
      const result = getSafeTerminalWidth(80);
      assert.equal(result, 78); // 80 - 2 (default margin)
    });

    it('should use custom margin', () => {
      const result = getSafeTerminalWidth(80, 5);
      assert.equal(result, 75); // 80 - 5
    });

    it('should enforce minimum width', () => {
      const result = getSafeTerminalWidth(8, 2);
      assert.equal(result, MIN_COMPONENT_WIDTH); // 8 - 2 = 6, but min is 10
    });

    it('should fallback to 80 for undefined columns', () => {
      const result = getSafeTerminalWidth(undefined);
      assert.equal(result, 78); // 80 - 2
    });

    it('should fallback to 80 for zero columns', () => {
      const result = getSafeTerminalWidth(0);
      assert.equal(result, 78); // 80 - 2
    });

    it('should fallback to 80 for negative columns', () => {
      const result = getSafeTerminalWidth(-5);
      assert.equal(result, 78); // 80 - 2
    });

    it('should handle large margin values', () => {
      const result = getSafeTerminalWidth(80, 100);
      assert.equal(result, MIN_COMPONENT_WIDTH); // Would be negative, so use minimum
    });
  });

  describe('Constants', () => {
    it('should have reasonable default margin', () => {
      assert.equal(DEFAULT_TERMINAL_MARGIN, 4);
      assert.equal(typeof DEFAULT_TERMINAL_MARGIN, 'number');
    });

    it('should have reasonable minimum width', () => {
      assert.equal(MIN_COMPONENT_WIDTH, 10);
      assert.equal(typeof MIN_COMPONENT_WIDTH, 'number');
    });
  });
});