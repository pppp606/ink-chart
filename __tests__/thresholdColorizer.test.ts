import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ThresholdColorizer } from '../src/core/thresholdColorizer.js';

import * as ansi from '../src/core/ansi.js';

type ColorFn = (text: string) => string;

/**
 * Expands `[red1]x[/red1]` markers into the real ANSI output of the matching
 * color function, so expectations stay readable.
 */
function styled(marked: string): string {
  return marked.replace(/\[(\w+)\](.*?)\[\/\1\]/g, (_match, name: string, text: string) => {
    const colorFn = (ansi as unknown as Record<string, ColorFn | undefined>)[name];
    assert.equal(typeof colorFn, 'function', `Unknown color function: ${name}`);
    return (colorFn as ColorFn)(text);
  });
}

// Truecolor gives every gradient step a distinct escape code, so a wrong step is detected.
const originalDepth = process.env.FORCE_COLOR_DEPTH;

before(() => {
  process.env.FORCE_COLOR_DEPTH = '8';
  ansi.resetColorDepthCache();
});

after(() => {
  if (originalDepth === undefined) {
    delete process.env.FORCE_COLOR_DEPTH;
  } else {
    process.env.FORCE_COLOR_DEPTH = originalDepth;
  }
  ansi.resetColorDepthCache();
});

describe('ThresholdColorizer', () => {
  describe('Single threshold highlighting', () => {
    it('should highlight symbols above threshold with red scheme', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▄', '▇'];
      const data = [1, 5, 8];
      const threshold = 4;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      assert.equal(result, styled('▁[red]▄[/red][red]▇[/red]'));
    });

    it('should not highlight symbols below threshold', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▂', '▃'];
      const data = [1, 2, 3];
      const threshold = 5;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      assert.equal(result, '▁▂▃');
    });

    it('should handle exact threshold values', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▄'];
      const data = [4, 5];
      const threshold = 4;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      assert.equal(result, styled('▁[red]▄[/red]'));
    });
  });

  describe('Multiple threshold highlighting', () => {
    it('should apply gradient colors based on thresholds', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▃', '▅', '▇'];
      const data = [1, 3, 6, 9];
      const thresholds = [2, 5, 8];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      assert.equal(result, styled('▁[red1]▃[/red1][red2]▅[/red2][red3]▇[/red3]'));
    });

    it('should handle unsorted thresholds', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▄'];
      const data = [6];
      const thresholds = [8, 2, 5]; // Unsorted
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      assert.equal(result, styled('[red2]▄[/red2]')); // Should use index 2 (value 6 > threshold 5)
    });

    it('should not highlight values below all thresholds', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁'];
      const data = [1];
      const thresholds = [2, 5, 8];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      assert.equal(result, '▁');
    });
  });

  describe('Color schemes', () => {
    it('should use blue gradient for blue color scheme', () => {
      const colorizer = new ThresholdColorizer('blue');
      const symbols = ['▄'];
      const data = [6];
      const thresholds = [2, 5];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      assert.equal(result, styled('[blue2]▄[/blue2]')); // Index 1 -> blue2
    });

    it('should use green gradient for green color scheme', () => {
      const colorizer = new ThresholdColorizer('green');
      const symbols = ['▄'];
      const data = [6];
      const thresholds = [2, 5];
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      assert.equal(result, styled('[green2]▄[/green2]')); // Index 1 -> green2
    });

    it('should default to red gradient', () => {
      const colorizer = new ThresholdColorizer();
      const symbols = ['▄'];
      const data = [6];
      const threshold = 4;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      assert.equal(result, styled('[red]▄[/red]'));
    });
  });

  describe('Edge cases', () => {
    it('should handle empty symbols array', () => {
      const colorizer = new ThresholdColorizer('red');
      const result = colorizer.applyHighlighting([], [], 5);
      assert.equal(result, '');
    });

    it('should handle undefined data values', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▁', '▄'];
      const data = [1]; // Only one data point for two symbols
      const threshold = 0;
      
      const result = colorizer.applyHighlighting(symbols, data, threshold);
      assert.equal(result, styled('[red]▁[/red][red]▄[/red]')); // Both use the single data value
    });

    it('should handle index beyond gradient colors array', () => {
      const colorizer = new ThresholdColorizer('red');
      const symbols = ['▄'];
      const data = [100];
      const thresholds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // More than 8 thresholds
      
      const result = colorizer.applyHighlighting(symbols, data, thresholds);
      assert.equal(result, styled('[red8]▄[/red8]')); // Should cap at red8
    });
  });
});