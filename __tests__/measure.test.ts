import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { measureWidth, truncateText } from '../src/measure.js';

describe('measure functions', () => {
  describe('measureWidth', () => {
    it('should measure ASCII characters as width 1 each', () => {
      assert.equal(measureWidth('ABC'), 3);
      assert.equal(measureWidth('Hello World'), 11);
      assert.equal(measureWidth('123456'), 6);
    });

    it('should measure full-width characters as width 2 each', () => {
      assert.equal(measureWidth('ＡＢ'), 4);  // Full-width A, B
      assert.equal(measureWidth('１２３'), 6);  // Full-width 1, 2, 3
      assert.equal(measureWidth('ｈｅｌｌｏ'), 10); // Full-width hello
    });

    it('should measure emoji as width 2 each', () => {
      assert.equal(measureWidth('🦌'), 2);
      assert.equal(measureWidth('🚀🌟'), 4);
      assert.equal(measureWidth('👨‍💻'), 2); // Complex emoji with ZWJ
    });

    it('should handle mixed character types', () => {
      assert.equal(measureWidth('A🦌B'), 4); // 1 + 2 + 1 = 4
      assert.equal(measureWidth('Hello🌟World'), 12); // 5 + 2 + 5 = 12
      assert.equal(measureWidth('Aｈｅ'), 5); // 1 + 2 + 2 = 5
    });

    it('should handle empty strings', () => {
      assert.equal(measureWidth(''), 0);
    });

    it('should handle control characters and zero-width characters', () => {
      assert.equal(measureWidth('\t'), 1); // Tab as width 1
      assert.equal(measureWidth('\n'), 0); // Newline as width 0
      assert.equal(measureWidth('\u200B'), 0); // Zero-width space
    });

    it('should handle combining characters', () => {
      assert.equal(measureWidth('é'), 1); // e with acute accent (composed)
      assert.equal(measureWidth('e\u0301'), 1); // e + combining acute accent
    });
  });

  describe('truncateText', () => {
    it('should truncate ASCII text with ellipsis when exceeding limit', () => {
      assert.equal(truncateText('Hello World', 8), 'Hello W…');
      assert.equal(truncateText('ABCDEFGHIJ', 5), 'ABCD…');
    });

    it('should return original text when within limit', () => {
      assert.equal(truncateText('Short', 10), 'Short');
      assert.equal(truncateText('Exact', 5), 'Exact');
    });

    it('should handle full-width characters correctly', () => {
      assert.equal(truncateText('ＡＢ', 4), 'ＡＢ'); // Should fit exactly 2 full-width chars without ellipsis
      assert.equal(truncateText('ＡＢＣ', 4), 'Ａ…'); // Can't fit AB+ellipsis in 4, so only A+ellipsis=3
      assert.equal(truncateText('ＡＢＣＤ', 5), 'ＡＢ…'); // 2 chars + ellipsis = 5 width
    });

    it('should handle emoji truncation', () => {
      assert.equal(truncateText('🚀🌟', 4), '🚀🌟'); // Exactly 2 emoji = 4 width without ellipsis
      assert.equal(truncateText('🚀🌟🦌', 4), '🚀…'); // Can't fit 2 emoji + ellipsis in 4, so 1 emoji + ellipsis = 3
      assert.equal(truncateText('🚀🌟🦌', 5), '🚀🌟…'); // 2 emoji + ellipsis = 5 width
    });

    it('should handle mixed content truncation', () => {
      assert.equal(truncateText('A🦌BC', 4), 'A🦌…'); // 1 + 2 + 1 ellipsis = 4
      assert.equal(truncateText('Hello🌟', 7), 'Hello🌟'); // Exactly fits
      assert.equal(truncateText('Hello🌟World', 8), 'Hello🌟…'); // Truncate at word boundary
    });

    it('should ensure visual width never exceeds limit after truncation', () => {
      const testStrings = [
        'Hello World',
        'ＡＢＣＤＥＦ',
        '🚀🌟🦌🎉',
        'Mix🌟Text',
        'ｈｅｌｌｏ'
      ];
      
      for (const text of testStrings) {
        for (let limit = 1; limit <= 10; limit++) {
          const truncated = truncateText(text, limit);
          assert.ok(measureWidth(truncated) <= limit);
        }
      }
    });

    it('should handle edge cases gracefully', () => {
      assert.equal(truncateText('', 5), '');
      assert.equal(truncateText('A', 1), 'A');
      assert.equal(truncateText('AB', 1), '…'); // Must truncate to fit
      assert.equal(truncateText('🦌', 1), '…'); // Wide char needs truncation
    });

    it('should handle single character edge case correctly', () => {
      assert.equal(truncateText('A', 0), '');
      assert.equal(truncateText('🦌', 2), '🦌'); // Exactly fits
      assert.equal(truncateText('🦌', 1), '…'); // Too wide, show ellipsis
    });
  });
});