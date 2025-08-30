import { isZeroWidth, isCombining, isWideCharacter } from './core/unicode.js';

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