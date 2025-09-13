import { isZeroWidth, isCombining, isWideCharacter } from '../src/core/unicode.js';

describe('Unicode Character Classification', () => {
  describe('isZeroWidth', () => {
    it('should identify zero-width joiner', () => {
      expect(isZeroWidth(0x200D)).toBe(true);
    });

    it('should identify zero-width spaces and marks', () => {
      expect(isZeroWidth(0x200B)).toBe(true); // Zero-width space
      expect(isZeroWidth(0x200C)).toBe(true); // Zero-width non-joiner
      expect(isZeroWidth(0x200F)).toBe(true); // Right-to-left mark
    });

    it('should identify various zero-width characters', () => {
      expect(isZeroWidth(0x2060)).toBe(true); // Word joiner
      expect(isZeroWidth(0x206F)).toBe(true); // Nominal digit shapes
    });

    it('should identify zero-width no-break space', () => {
      expect(isZeroWidth(0xFEFF)).toBe(true);
    });

    it('should return false for regular characters', () => {
      expect(isZeroWidth(0x0041)).toBe(false); // A
      expect(isZeroWidth(0x3042)).toBe(false); // a (hiragana)
      expect(isZeroWidth(0x1F600)).toBe(false); // 😀
    });
  });

  describe('isCombining', () => {
    it('should identify combining diacritical marks', () => {
      expect(isCombining(0x0300)).toBe(true); // Combining grave accent
      expect(isCombining(0x0301)).toBe(true); // Combining acute accent
      expect(isCombining(0x036F)).toBe(true); // Combining latin small letter x
    });

    it('should identify combining diacritical marks extended', () => {
      expect(isCombining(0x1AB0)).toBe(true);
      expect(isCombining(0x1AFF)).toBe(true);
    });

    it('should identify combining diacritical marks supplement', () => {
      expect(isCombining(0x1DC0)).toBe(true);
      expect(isCombining(0x1DFF)).toBe(true);
    });

    it('should identify combining diacritical marks for symbols', () => {
      expect(isCombining(0x20D0)).toBe(true);
      expect(isCombining(0x20FF)).toBe(true);
    });

    it('should identify combining half marks', () => {
      expect(isCombining(0xFE20)).toBe(true);
      expect(isCombining(0xFE2F)).toBe(true);
    });

    it('should return false for non-combining characters', () => {
      expect(isCombining(0x0041)).toBe(false); // A
      expect(isCombining(0x3042)).toBe(false); // a (hiragana)
      expect(isCombining(0x1F600)).toBe(false); // 😀
    });
  });

  describe('isWideCharacter', () => {
    it('should identify hangul jamo', () => {
      expect(isWideCharacter(0x1100)).toBe(true);
      expect(isWideCharacter(0x115F)).toBe(true);
    });

    it('should identify watch and hourglass symbols', () => {
      expect(isWideCharacter(0x231A)).toBe(true); // Watch
      expect(isWideCharacter(0x231B)).toBe(true); // Hourglass
    });

    it('should identify media control symbols', () => {
      expect(isWideCharacter(0x23E9)).toBe(true); // Fast forward
      expect(isWideCharacter(0x23EC)).toBe(true); // Fast reverse
    });

    it('should identify zodiac signs', () => {
      expect(isWideCharacter(0x2648)).toBe(true); // Aries
      expect(isWideCharacter(0x2653)).toBe(true); // Pisces
    });

    it('should identify CJK characters', () => {
      expect(isWideCharacter(0x3042)).toBe(true); // a (Hiragana)
      expect(isWideCharacter(0x30A2)).toBe(true); // a (Katakana)
      expect(isWideCharacter(0x4E00)).toBe(true); // one (CJK)
    });

    it('should identify hangul syllables', () => {
      expect(isWideCharacter(0xAC00)).toBe(true); // 가
      expect(isWideCharacter(0xD7A3)).toBe(true); // 힣
    });

    it('should identify fullwidth forms', () => {
      expect(isWideCharacter(0xFF00)).toBe(true); // Fullwidth space
      expect(isWideCharacter(0xFF41)).toBe(true); // Fullwidth a
    });

    it('should identify emoji and symbols', () => {
      expect(isWideCharacter(0x1F004)).toBe(true); // Mahjong tile
      expect(isWideCharacter(0x1F600)).toBe(true); // 😀
      expect(isWideCharacter(0x1F9FF)).toBe(true); // Puzzle piece
    });

    it('should return false for narrow characters', () => {
      expect(isWideCharacter(0x0041)).toBe(false); // A
      expect(isWideCharacter(0x0021)).toBe(false); // !
      expect(isWideCharacter(0x0020)).toBe(false); // Space
    });

    it('should handle edge cases', () => {
      expect(isWideCharacter(0x10FF)).toBe(false); // Just before Hangul Jamo
      expect(isWideCharacter(0x1160)).toBe(false); // Just after Hangul Jamo
    });
  });
});