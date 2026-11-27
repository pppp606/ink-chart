import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isZeroWidth, isCombining, isWideCharacter } from '../src/core/unicode.js';

describe('Unicode Character Classification', () => {
  describe('isZeroWidth', () => {
    it('should identify zero-width joiner', () => {
      assert.equal(isZeroWidth(0x200D), true);
    });

    it('should identify zero-width spaces and marks', () => {
      assert.equal(isZeroWidth(0x200B), true); // Zero-width space
      assert.equal(isZeroWidth(0x200C), true); // Zero-width non-joiner
      assert.equal(isZeroWidth(0x200F), true); // Right-to-left mark
    });

    it('should identify various zero-width characters', () => {
      assert.equal(isZeroWidth(0x2060), true); // Word joiner
      assert.equal(isZeroWidth(0x206F), true); // Nominal digit shapes
    });

    it('should identify zero-width no-break space', () => {
      assert.equal(isZeroWidth(0xFEFF), true);
    });

    it('should return false for regular characters', () => {
      assert.equal(isZeroWidth(0x0041), false); // A
      assert.equal(isZeroWidth(0x3042), false); // a (hiragana)
      assert.equal(isZeroWidth(0x1F600), false); // 😀
    });
  });

  describe('isCombining', () => {
    it('should identify combining diacritical marks', () => {
      assert.equal(isCombining(0x0300), true); // Combining grave accent
      assert.equal(isCombining(0x0301), true); // Combining acute accent
      assert.equal(isCombining(0x036F), true); // Combining latin small letter x
    });

    it('should identify combining diacritical marks extended', () => {
      assert.equal(isCombining(0x1AB0), true);
      assert.equal(isCombining(0x1AFF), true);
    });

    it('should identify combining diacritical marks supplement', () => {
      assert.equal(isCombining(0x1DC0), true);
      assert.equal(isCombining(0x1DFF), true);
    });

    it('should identify combining diacritical marks for symbols', () => {
      assert.equal(isCombining(0x20D0), true);
      assert.equal(isCombining(0x20FF), true);
    });

    it('should identify combining half marks', () => {
      assert.equal(isCombining(0xFE20), true);
      assert.equal(isCombining(0xFE2F), true);
    });

    it('should return false for non-combining characters', () => {
      assert.equal(isCombining(0x0041), false); // A
      assert.equal(isCombining(0x3042), false); // a (hiragana)
      assert.equal(isCombining(0x1F600), false); // 😀
    });
  });

  describe('isWideCharacter', () => {
    it('should identify hangul jamo', () => {
      assert.equal(isWideCharacter(0x1100), true);
      assert.equal(isWideCharacter(0x115F), true);
    });

    it('should identify watch and hourglass symbols', () => {
      assert.equal(isWideCharacter(0x231A), true); // Watch
      assert.equal(isWideCharacter(0x231B), true); // Hourglass
    });

    it('should identify media control symbols', () => {
      assert.equal(isWideCharacter(0x23E9), true); // Fast forward
      assert.equal(isWideCharacter(0x23EC), true); // Fast reverse
    });

    it('should identify zodiac signs', () => {
      assert.equal(isWideCharacter(0x2648), true); // Aries
      assert.equal(isWideCharacter(0x2653), true); // Pisces
    });

    it('should identify CJK characters', () => {
      assert.equal(isWideCharacter(0x3042), true); // a (Hiragana)
      assert.equal(isWideCharacter(0x30A2), true); // a (Katakana)
      assert.equal(isWideCharacter(0x4E00), true); // one (CJK)
    });

    it('should identify hangul syllables', () => {
      assert.equal(isWideCharacter(0xAC00), true); // 가
      assert.equal(isWideCharacter(0xD7A3), true); // 힣
    });

    it('should identify fullwidth forms', () => {
      assert.equal(isWideCharacter(0xFF00), true); // Fullwidth space
      assert.equal(isWideCharacter(0xFF41), true); // Fullwidth a
    });

    it('should identify emoji and symbols', () => {
      assert.equal(isWideCharacter(0x1F004), true); // Mahjong tile
      assert.equal(isWideCharacter(0x1F600), true); // 😀
      assert.equal(isWideCharacter(0x1F9FF), true); // Puzzle piece
    });

    it('should return false for narrow characters', () => {
      assert.equal(isWideCharacter(0x0041), false); // A
      assert.equal(isWideCharacter(0x0021), false); // !
      assert.equal(isWideCharacter(0x0020), false); // Space
    });

    it('should handle edge cases', () => {
      assert.equal(isWideCharacter(0x10FF), false); // Just before Hangul Jamo
      assert.equal(isWideCharacter(0x1160), false); // Just after Hangul Jamo
    });
  });
});