/**
 * Measures the display width of a string, accounting for Unicode characters.
 * 
 * @param text - The text to measure
 * @returns The visual width of the text (number of columns it occupies)
 */
export function measureWidth(text: string): number {
  if (!text) return 0;
  
  let width = 0;
  let i = 0;
  
  // Convert to array to handle surrogate pairs correctly
  const chars = Array.from(text);
  
  while (i < chars.length) {
    const char = chars[i];
    if (!char) {
      i++;
      continue;
    }
    const code = char.codePointAt(0);
    if (code === undefined) {
      i++;
      continue;
    }
    
    // Handle control characters
    if (code === 0x09) { // Tab
      width += 1;
      i++;
      continue;
    }
    
    if (code === 0x0A || code === 0x0D) { // Newline, Carriage return
      i++;
      continue; // Width 0
    }
    
    // Handle zero-width characters (including ZWJ)
    if (isZeroWidth(code)) {
      i++;
      continue;
    }
    
    // Handle combining characters
    if (isCombining(code)) {
      i++;
      continue;
    }
    
    // Check if this starts an emoji sequence with ZWJ
    if (isWideCharacter(code)) {
      // Skip any following ZWJ sequences
      let j = i + 1;
      while (j < chars.length) {
        const nextChar = chars[j];
        if (!nextChar) {
          j++;
          continue;
        }
        const nextCode = nextChar.codePointAt(0);
        if (nextCode === 0x200D) { // ZWJ
          j++; // Skip ZWJ
          if (j < chars.length) {
            const afterZWJ = chars[j];
            if (afterZWJ && isWideCharacter(afterZWJ.codePointAt(0) ?? 0)) {
              j++; // Skip the character after ZWJ
            }
          }
        } else {
          break;
        }
      }
      width += 2;
      i = j;
    } else {
      width += 1;
      i++;
    }
  }
  
  return width;
}

/**
 * Truncates text to fit within a specified width, adding an ellipsis if needed.
 * 
 * @param text - The text to truncate
 * @param maxWidth - Maximum display width allowed
 * @returns The truncated text that fits within maxWidth
 */
export function truncateText(text: string, maxWidth: number): string {
  if (maxWidth <= 0) return '';
  if (!text) return '';
  
  const currentWidth = measureWidth(text);
  if (currentWidth <= maxWidth) return text;
  
  // Need to truncate
  const ellipsis = '…';
  const ellipsisWidth = 1;
  
  if (maxWidth < ellipsisWidth) {
    return '';
  }
  
  // If we can only fit the ellipsis
  if (maxWidth === ellipsisWidth) {
    return ellipsis;
  }
  
  // Build truncated string using the same logic as measureWidth to handle ZWJ sequences
  const chars = Array.from(text);
  let truncated = '';
  let width = 0;
  let i = 0;
  
  // First, try to fit as many complete characters as possible within maxWidth
  while (i < chars.length) {
    const char = chars[i];
    if (!char) {
      i++;
      continue;
    }
    const code = char.codePointAt(0);
    if (code === undefined) {
      i++;
      continue;
    }
    
    // Handle control characters
    if (code === 0x09) {
      if (width + 1 <= maxWidth) {
        truncated += char;
        width += 1;
        i++;
        continue;
      } else {
        break;
      }
    }
    
    if (code === 0x0A || code === 0x0D) {
      i++;
      continue;
    }
    
    // Handle zero-width and combining characters
    if (isZeroWidth(code) || isCombining(code)) {
      truncated += char;
      i++;
      continue;
    }
    
    // Handle wide characters with ZWJ sequences
    if (isWideCharacter(code)) {
      let sequenceChars = char;
      let j = i + 1;
      
      // Collect full ZWJ sequence
      while (j < chars.length) {
        const nextChar = chars[j];
        if (!nextChar) {
          j++;
          continue;
        }
        const nextCode = nextChar.codePointAt(0);
        if (nextCode === 0x200D) { // ZWJ
          sequenceChars += nextChar;
          j++;
          if (j < chars.length) {
            const afterZWJ = chars[j];
            if (afterZWJ && isWideCharacter(afterZWJ.codePointAt(0) ?? 0)) {
              sequenceChars += afterZWJ;
              j++;
            }
          }
        } else {
          break;
        }
      }
      
      if (width + 2 <= maxWidth) {
        truncated += sequenceChars;
        width += 2;
        i = j;
      } else {
        break;
      }
    } else {
      if (width + 1 <= maxWidth) {
        truncated += char;
        width += 1;
        i++;
      } else {
        break;
      }
    }
  }
  
  // If we truncated the text and haven't reached the end, add ellipsis
  if (i < chars.length) {
    // Check if we have space for ellipsis
    if (width + ellipsisWidth <= maxWidth) {
      return truncated + ellipsis;
    } else {
      // Need to remove some characters to make space for ellipsis
      const targetWidth = maxWidth - ellipsisWidth;
      let finalTruncated = '';
      let finalWidth = 0;
      let k = 0;
      
      const truncatedChars = Array.from(truncated);
      while (k < truncatedChars.length) {
        const char = truncatedChars[k];
        if (!char) {
          k++;
          continue;
        }
        const charWidth = measureWidth(char);
        
        if (finalWidth + charWidth <= targetWidth) {
          finalTruncated += char;
          finalWidth += charWidth;
          k++;
        } else {
          break;
        }
      }
      
      return finalTruncated + ellipsis;
    }
  }
  
  return truncated;
}

/**
 * Checks if a Unicode code point represents a zero-width character.
 */
function isZeroWidth(code: number): boolean {
  return (
    code === 0x200D || // Zero-width joiner
    (code >= 0x200B && code <= 0x200F) || // Zero-width spaces and marks
    (code >= 0x2060 && code <= 0x206F) || // Various zero-width characters
    code === 0xFEFF // Zero-width no-break space
  );
}

/**
 * Checks if a Unicode code point represents a combining character.
 */
function isCombining(code: number): boolean {
  return (
    (code >= 0x0300 && code <= 0x036F) || // Combining Diacritical Marks
    (code >= 0x1AB0 && code <= 0x1AFF) || // Combining Diacritical Marks Extended
    (code >= 0x1DC0 && code <= 0x1DFF) || // Combining Diacritical Marks Supplement
    (code >= 0x20D0 && code <= 0x20FF) || // Combining Diacritical Marks for Symbols
    (code >= 0xFE20 && code <= 0xFE2F)    // Combining Half Marks
  );
}

/**
 * Checks if a Unicode code point represents a wide character (width 2).
 */
function isWideCharacter(code: number): boolean {
  // East Asian Width property: Fullwidth and Wide characters
  return (
    (code >= 0x1100 && code <= 0x115F) ||   // Hangul Jamo
    (code >= 0x231A && code <= 0x231B) ||   // Watch, Hourglass
    (code >= 0x2329 && code <= 0x232A) ||   // Angle brackets
    (code >= 0x23E9 && code <= 0x23EC) ||   // Media control symbols
    code === 0x23F0 ||                      // Alarm clock
    code === 0x23F3 ||                      // Hourglass with flowing sand
    (code >= 0x25FD && code <= 0x25FE) ||   // Small squares
    (code >= 0x2614 && code <= 0x2615) ||   // Umbrella, Hot beverage
    (code >= 0x2648 && code <= 0x2653) ||   // Zodiac signs
    code === 0x267F ||                      // Wheelchair symbol
    (code >= 0x2693 && code <= 0x2693) ||   // Anchor
    code === 0x26A1 ||                      // High voltage
    (code >= 0x26AA && code <= 0x26AB) ||   // Circles
    (code >= 0x26BD && code <= 0x26BE) ||   // Soccer ball, Baseball
    (code >= 0x26C4 && code <= 0x26C5) ||   // Snowman, Sun
    code === 0x26CE ||                      // Ophiuchus
    (code >= 0x26D4 && code <= 0x26D4) ||   // No entry sign
    (code >= 0x26EA && code <= 0x26EA) ||   // Church
    (code >= 0x26F2 && code <= 0x26F3) ||   // Fountain, Golf flag
    (code >= 0x26F5 && code <= 0x26F5) ||   // Sailboat
    (code >= 0x26FA && code <= 0x26FA) ||   // Tent
    (code >= 0x26FD && code <= 0x26FD) ||   // Fuel pump
    (code >= 0x2705 && code <= 0x2705) ||   // Check mark
    (code >= 0x270A && code <= 0x270B) ||   // Fists
    code === 0x2728 ||                      // Sparkles
    code === 0x274C ||                      // Cross mark
    code === 0x274E ||                      // Cross mark
    (code >= 0x2753 && code <= 0x2755) ||   // Question marks
    code === 0x2757 ||                      // Exclamation mark
    (code >= 0x2795 && code <= 0x2797) ||   // Plus/minus signs
    code === 0x27B0 ||                      // Curly loop
    code === 0x27BF ||                      // Double curly loop
    (code >= 0x2B1B && code <= 0x2B1C) ||   // Squares
    code === 0x2B50 ||                      // Star
    code === 0x2B55 ||                      // Circle
    (code >= 0x2E80 && code <= 0x2E99) ||   // CJK Radicals Supplement
    (code >= 0x2E9B && code <= 0x2EF3) ||   // CJK Radicals Supplement
    (code >= 0x2F00 && code <= 0x2FD5) ||   // Kangxi Radicals
    (code >= 0x2FF0 && code <= 0x2FFB) ||   // Ideographic Description Characters
    (code >= 0x3000 && code <= 0x303E) ||   // CJK Symbols and Punctuation
    (code >= 0x3041 && code <= 0x3096) ||   // Hiragana
    (code >= 0x3099 && code <= 0x30FF) ||   // Katakana
    (code >= 0x3105 && code <= 0x312F) ||   // Bopomofo
    (code >= 0x3131 && code <= 0x318E) ||   // Hangul Compatibility Jamo
    (code >= 0x3190 && code <= 0x31E3) ||   // CJK Strokes
    (code >= 0x31F0 && code <= 0x321E) ||   // Katakana Phonetic Extensions
    (code >= 0x3220 && code <= 0x3247) ||   // Enclosed CJK Letters and Months
    (code >= 0x3250 && code <= 0x4DBF) ||   // CJK Extension A
    (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
    (code >= 0xA960 && code <= 0xA97F) ||   // Hangul Jamo Extended-A
    (code >= 0xAC00 && code <= 0xD7A3) ||   // Hangul Syllables
    (code >= 0xD7B0 && code <= 0xD7C6) ||   // Hangul Jamo Extended-B
    (code >= 0xD7CB && code <= 0xD7FB) ||   // Hangul Jamo Extended-B
    (code >= 0xF900 && code <= 0xFAFF) ||   // CJK Compatibility Ideographs
    (code >= 0xFE10 && code <= 0xFE19) ||   // Vertical Forms
    (code >= 0xFE30 && code <= 0xFE6F) ||   // CJK Compatibility Forms
    (code >= 0xFF00 && code <= 0xFF60) ||   // Fullwidth Forms
    (code >= 0xFFE0 && code <= 0xFFE6) ||   // Fullwidth Forms
    (code >= 0x16FE0 && code <= 0x16FE4) || // Tangut Ideographic Symbols
    (code >= 0x17000 && code <= 0x187F7) || // Tangut
    (code >= 0x18800 && code <= 0x18CD5) || // Tangut Components
    (code >= 0x18D00 && code <= 0x18D08) || // Tangut Supplement
    (code >= 0x1B000 && code <= 0x1B11E) || // Kana Supplement
    (code >= 0x1B150 && code <= 0x1B152) || // Hiragana
    (code >= 0x1B164 && code <= 0x1B167) || // Katakana
    (code >= 0x1B170 && code <= 0x1B2FB) || // Nushu
    (code >= 0x1F004 && code <= 0x1F004) || // Mahjong Tile
    (code >= 0x1F0CF && code <= 0x1F0CF) || // Playing card
    (code >= 0x1F18E && code <= 0x1F18E) || // AB button
    (code >= 0x1F191 && code <= 0x1F19A) || // Squared symbols
    (code >= 0x1F200 && code <= 0x1F202) || // Squared symbols
    (code >= 0x1F210 && code <= 0x1F23B) || // Squared symbols
    (code >= 0x1F240 && code <= 0x1F248) || // Squared symbols
    (code >= 0x1F250 && code <= 0x1F251) || // Squared symbols
    (code >= 0x1F260 && code <= 0x1F265) || // Miscellaneous symbols
    (code >= 0x1F300 && code <= 0x1F6FF) || // Miscellaneous Symbols and Pictographs
    (code >= 0x1F700 && code <= 0x1F77F) || // Alchemical Symbols
    (code >= 0x1F780 && code <= 0x1F7FF) || // Geometric Shapes Extended
    (code >= 0x1F800 && code <= 0x1F8FF) || // Supplemental Arrows-C
    (code >= 0x1F900 && code <= 0x1F9FF) || // Supplemental Symbols and Pictographs
    (code >= 0x1FA00 && code <= 0x1FA6F) || // Chess Symbols
    (code >= 0x1FA70 && code <= 0x1FAFF) || // Symbols and Pictographs Extended-A
    (code >= 0x20000 && code <= 0x2FFFD) || // CJK Extension B, C, D, E, F
    (code >= 0x30000 && code <= 0x3FFFD)    // CJK Extension G
  );
}