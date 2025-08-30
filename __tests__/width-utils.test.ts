import { calculateEffectiveWidth, getSafeTerminalWidth, DEFAULT_TERMINAL_MARGIN, MIN_COMPONENT_WIDTH } from '../src/core/width-utils.js';

describe('Width Utilities', () => {
  describe('calculateEffectiveWidth', () => {
    it('should return auto for auto width', () => {
      const result = calculateEffectiveWidth('auto', 80);
      expect(result).toBe('auto');
    });

    it('should calculate full width with margin', () => {
      const result = calculateEffectiveWidth('full', 80);
      expect(result).toBe(80 - DEFAULT_TERMINAL_MARGIN);
    });

    it('should enforce minimum width for full mode', () => {
      const result = calculateEffectiveWidth('full', 8); // Very small terminal
      expect(result).toBe(MIN_COMPONENT_WIDTH);
    });

    it('should return exact number for fixed width', () => {
      const result = calculateEffectiveWidth(50, 80);
      expect(result).toBe(50);
    });

    it('should handle zero terminal width', () => {
      const result = calculateEffectiveWidth('full', 0);
      expect(result).toBe(MIN_COMPONENT_WIDTH);
    });

    it('should handle negative terminal width', () => {
      const result = calculateEffectiveWidth('full', -10);
      expect(result).toBe(MIN_COMPONENT_WIDTH);
    });
  });

  describe('getSafeTerminalWidth', () => {
    it('should subtract default margin from valid columns', () => {
      const result = getSafeTerminalWidth(80);
      expect(result).toBe(78); // 80 - 2 (default margin)
    });

    it('should use custom margin', () => {
      const result = getSafeTerminalWidth(80, 5);
      expect(result).toBe(75); // 80 - 5
    });

    it('should enforce minimum width', () => {
      const result = getSafeTerminalWidth(8, 2);
      expect(result).toBe(MIN_COMPONENT_WIDTH); // 8 - 2 = 6, but min is 10
    });

    it('should fallback to 80 for undefined columns', () => {
      const result = getSafeTerminalWidth(undefined);
      expect(result).toBe(78); // 80 - 2
    });

    it('should fallback to 80 for zero columns', () => {
      const result = getSafeTerminalWidth(0);
      expect(result).toBe(78); // 80 - 2
    });

    it('should fallback to 80 for negative columns', () => {
      const result = getSafeTerminalWidth(-5);
      expect(result).toBe(78); // 80 - 2
    });

    it('should handle large margin values', () => {
      const result = getSafeTerminalWidth(80, 100);
      expect(result).toBe(MIN_COMPONENT_WIDTH); // Would be negative, so use minimum
    });
  });

  describe('Constants', () => {
    it('should have reasonable default margin', () => {
      expect(DEFAULT_TERMINAL_MARGIN).toBe(4);
      expect(typeof DEFAULT_TERMINAL_MARGIN).toBe('number');
    });

    it('should have reasonable minimum width', () => {
      expect(MIN_COMPONENT_WIDTH).toBe(10);
      expect(typeof MIN_COMPONENT_WIDTH).toBe('number');
    });
  });
});