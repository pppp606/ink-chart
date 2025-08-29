import { stripAnsi } from './stripAnsi.js';

/**
 * Extract and analyze frame content for testing
 */
export class FrameUtils {
  private cleanFrame: string;
  private lines: string[];

  constructor(frame: string) {
    this.cleanFrame = stripAnsi(frame);
    this.lines = this.cleanFrame.split('\n').filter(line => line.trim() !== '');
  }

  /**
   * Get all lines from the frame
   */
  getLines(): string[] {
    return this.lines;
  }

  /**
   * Get a specific line by index
   */
  getLine(index: number): string | undefined {
    return this.lines[index];
  }

  /**
   * Get the number of lines
   */
  getLineCount(): number {
    return this.lines.length;
  }

  /**
   * Extract bar lengths from BarChart output
   * Assumes bars are made of '█' characters
   */
  getBarLengths(): number[] {
    const barLengths: number[] = [];
    
    for (const line of this.lines) {
      const barMatch = line.match(/█+/);
      if (barMatch) {
        barLengths.push(barMatch[0].length);
      }
    }
    
    return barLengths;
  }

  /**
   * Extract labels from BarChart output
   * Assumes label is at the beginning of each line before the bar
   */
  getLabels(): string[] {
    const labels: string[] = [];
    
    for (const line of this.lines) {
      // Extract text before the first bar character
      const match = line.match(/^([^█]*)/);
      if (match) {
        labels.push(match[1].trim());
      }
    }
    
    return labels;
  }

  /**
   * Extract values from BarChart output
   * Assumes values are shown after the bar
   */
  getValues(): string[] {
    const values: string[] = [];
    
    for (const line of this.lines) {
      // Extract text after the last bar character
      const match = line.match(/█+\s*(.*)$/);
      if (match) {
        values.push(match[1].trim());
      }
    }
    
    return values;
  }

  /**
   * Check if a line contains threshold highlighting
   * (looks for different symbols or formatting)
   */
  hasThresholdHighlight(lineIndex: number): boolean {
    const line = this.lines[lineIndex];
    if (!line) return false;
    
    // Check for highlighting symbols like ▲, !, or other non-standard bar chars
    return /[▲!⚠]/.test(line) || line.includes('*') || line.includes('️');
  }

  /**
   * Get the width of the content (max line length)
   */
  getContentWidth(): number {
    return Math.max(...this.lines.map(line => line.length));
  }
}