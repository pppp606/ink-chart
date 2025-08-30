import { ThresholdColorizer } from '../src/core/threshold-colorizer.js';

// Mock the ansi module for testing
jest.mock('../src/core/ansi.js', () => ({
  red: (text: string) => `[red]${text}[/red]`,
  red1: (text: string) => `[red1]${text}[/red1]`,
  red2: (text: string) => `[red2]${text}[/red2]`,
  red3: (text: string) => `[red3]${text}[/red3]`,
  red4: (text: string) => `[red4]${text}[/red4]`,
  red5: (text: string) => `[red5]${text}[/red5]`,
  red6: (text: string) => `[red6]${text}[/red6]`,
  red7: (text: string) => `[red7]${text}[/red7]`,
  red8: (text: string) => `[red8]${text}[/red8]`,
  blue1: (text: string) => `[blue1]${text}[/blue1]`,
  blue2: (text: string) => `[blue2]${text}[/blue2]`,
  blue3: (text: string) => `[blue3]${text}[/blue3]`,
  blue4: (text: string) => `[blue4]${text}[/blue4]`,
  blue5: (text: string) => `[blue5]${text}[/blue5]`,
  blue6: (text: string) => `[blue6]${text}[/blue6]`,
  blue7: (text: string) => `[blue7]${text}[/blue7]`,
  blue8: (text: string) => `[blue8]${text}[/blue8]`,
  green1: (text: string) => `[green1]${text}[/green1]`,
  green2: (text: string) => `[green2]${text}[/green2]`,
  green3: (text: string) => `[green3]${text}[/green3]`,
  green4: (text: string) => `[green4]${text}[/green4]`,
  green5: (text: string) => `[green5]${text}[/green5]`,
  green6: (text: string) => `[green6]${text}[/green6]`,
  green7: (text: string) => `[green7]${text}[/green7]`,
  green8: (text: string) => `[green8]${text}[/green8]`,
}));

describe('ThresholdColorizer', () => {
  describe('Single threshold highlighting', () => {
    it('should highlight symbols above threshold with red scheme', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▄', '▇'];
      const data = [1, 5, 8];
      const threshold = 4;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      expect(result).toBe('▁[red]▄[/red][red]▇[/red]');
    });

    it('should not highlight symbols below threshold', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▂', '▃'];
      const data = [1, 2, 3];
      const threshold = 5;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      expect(result).toBe('▁▂▃');
    });

    it('should handle exact threshold values', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▄'];
      const data = [4, 5];
      const threshold = 4;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      expect(result).toBe('▁[red]▄[/red]');
    });
  });

  describe('Multiple threshold highlighting', () => {
    it('should apply gradient colors based on thresholds', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▃', '▅', '▇'];
      const data = [1, 3, 6, 9];
      const thresholds = [2, 5, 8];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      expect(result).toBe('▁[red1]▃[/red1][red2]▅[/red2][red3]▇[/red3]');
    });

    it('should handle unsorted thresholds', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▄'];
      const data = [6];
      const thresholds = [8, 2, 5]; // Unsorted
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      expect(result).toBe('[red2]▄[/red2]'); // Should use index 2 (value 6 > threshold 5)
    });

    it('should not highlight values below all thresholds', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁'];
      const data = [1];
      const thresholds = [2, 5, 8];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      expect(result).toBe('▁');
    });
  });

  describe('Color schemes', () => {
    it('should use blue gradient for blue color scheme', () => {
      const colorizer = new ThresholdColorizer('blue');
      const symbols = ['▄'];
      const data = [6];
      const thresholds = [2, 5];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      expect(result).toBe('[blue2]▄[/blue2]'); // Index 1 -> blue2
    });

    it('should use green gradient for green color scheme', () => {
      const colorizer = new ThresholdColorizer('green');
      const symbols = ['▄'];
      const data = [6];
      const thresholds = [2, 5];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      expect(result).toBe('[green2]▄[/green2]'); // Index 1 -> green2
    });

    it('should default to red gradient', () => {
      const colorizer = new ThresholdColorizer();
      const symbols = ['▄'];
      const data = [6];
      const threshold = 4;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      expect(result).toBe('[red]▄[/red]');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty symbols array', () => {
      const colorizer = new ThresholdColorizer('red');
      const result = colorizer.applyHighlighting([], [], 5);
      expect(result).toBe('');
    });

    it('should handle undefined data values', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▄'];
      const data = [1]; // Only one data point for two symbols
      const threshold = 0;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      expect(result).toBe('[red]▁[/red][red]▄[/red]'); // Both use the single data value
    });

    it('should handle index beyond gradient colors array', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▄'];
      const data = [100];
      const thresholds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // More than 8 thresholds
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      expect(result).toBe('[red8]▄[/red8]'); // Should cap at red8
    });
  });
});