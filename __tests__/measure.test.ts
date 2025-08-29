import { measureWidth, truncateText } from '../src/measure';

describe('measure functions', () => {
  describe('measureWidth', () => {
    it('should measure ASCII characters as width 1 each', () => {
      expect(measureWidth('ABC')).toBe(3);
      expect(measureWidth('Hello World')).toBe(11);
      expect(measureWidth('123456')).toBe(6);
    });

    it('should measure full-width characters as width 2 each', () => {
      expect(measureWidth('ＡＢ')).toBe(4);  // Full-width A, B
      expect(measureWidth('１２３')).toBe(6);  // Full-width 1, 2, 3
      expect(measureWidth('こんにちは')).toBe(10); // Japanese hiragana
    });

    it('should measure emoji as width 2 each', () => {
      expect(measureWidth('🦌')).toBe(2);
      expect(measureWidth('🚀🌟')).toBe(4);
      expect(measureWidth('👨‍💻')).toBe(2); // Complex emoji with ZWJ
    });

    it('should handle mixed character types', () => {
      expect(measureWidth('A🦌B')).toBe(4); // 1 + 2 + 1 = 4
      expect(measureWidth('Hello🌟World')).toBe(12); // 5 + 2 + 5 = 12
      expect(measureWidth('Aこん')).toBe(5); // 1 + 2 + 2 = 5
    });

    it('should handle empty strings', () => {
      expect(measureWidth('')).toBe(0);
    });

    it('should handle control characters and zero-width characters', () => {
      expect(measureWidth('\t')).toBe(1); // Tab as width 1
      expect(measureWidth('\n')).toBe(0); // Newline as width 0
      expect(measureWidth('\u200B')).toBe(0); // Zero-width space
    });

    it('should handle combining characters', () => {
      expect(measureWidth('é')).toBe(1); // e with acute accent (composed)
      expect(measureWidth('e\u0301')).toBe(1); // e + combining acute accent
    });
  });

  describe('truncateText', () => {
    it('should truncate ASCII text with ellipsis when exceeding limit', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello W…');
      expect(truncateText('ABCDEFGHIJ', 5)).toBe('ABCD…');
    });

    it('should return original text when within limit', () => {
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('Exact', 5)).toBe('Exact');
    });

    it('should handle full-width characters correctly', () => {
      expect(truncateText('ＡＢ', 4)).toBe('ＡＢ'); // Should fit exactly 2 full-width chars without ellipsis
      expect(truncateText('ＡＢＣ', 4)).toBe('Ａ…'); // Can't fit AB+ellipsis in 4, so only A+ellipsis=3
      expect(truncateText('ＡＢＣＤ', 5)).toBe('ＡＢ…'); // 2 chars + ellipsis = 5 width
    });

    it('should handle emoji truncation', () => {
      expect(truncateText('🚀🌟', 4)).toBe('🚀🌟'); // Exactly 2 emoji = 4 width without ellipsis
      expect(truncateText('🚀🌟🦌', 4)).toBe('🚀…'); // Can't fit 2 emoji + ellipsis in 4, so 1 emoji + ellipsis = 3
      expect(truncateText('🚀🌟🦌', 5)).toBe('🚀🌟…'); // 2 emoji + ellipsis = 5 width
    });

    it('should handle mixed content truncation', () => {
      expect(truncateText('A🦌BC', 4)).toBe('A🦌…'); // 1 + 2 + 1 ellipsis = 4
      expect(truncateText('Hello🌟', 7)).toBe('Hello🌟'); // Exactly fits
      expect(truncateText('Hello🌟World', 8)).toBe('Hello🌟…'); // Truncate at word boundary
    });

    it('should ensure visual width never exceeds limit after truncation', () => {
      const testStrings = [
        'Hello World',
        'ＡＢＣＤＥＦ',
        '🚀🌟🦌🎉',
        'Mix🌟Text',
        'こんにちは'
      ];
      
      for (const text of testStrings) {
        for (let limit = 1; limit <= 10; limit++) {
          const truncated = truncateText(text, limit);
          expect(measureWidth(truncated)).toBeLessThanOrEqual(limit);
        }
      }
    });

    it('should handle edge cases gracefully', () => {
      expect(truncateText('', 5)).toBe('');
      expect(truncateText('A', 1)).toBe('A');
      expect(truncateText('AB', 1)).toBe('…'); // Must truncate to fit
      expect(truncateText('🦌', 1)).toBe('…'); // Wide char needs truncation
    });

    it('should handle single character edge case correctly', () => {
      expect(truncateText('A', 0)).toBe('');
      expect(truncateText('🦌', 2)).toBe('🦌'); // Exactly fits
      expect(truncateText('🦌', 1)).toBe('…'); // Too wide, show ellipsis
    });
  });
});