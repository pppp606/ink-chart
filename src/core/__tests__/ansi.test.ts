import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertContains } from '../../../__tests__/helpers/assertions.js';
import {
  getColorDepth,
  resetColorDepthCache,
  red1, red2, red3, red4, red5, red6, red7, red8,
  blue1, blue5, blue8,
  green1, green5, green8,
  orange,
  stripAnsi,
  ANSI,
} from '../ansi.js';

describe('ansi', () => {
  describe('color depth detection', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment for each test
      process.env = { ...originalEnv };
      resetColorDepthCache();
    });

    afterEach(() => {
      process.env = originalEnv;
      resetColorDepthCache();
    });

    it('should detect 24-bit color when COLORTERM is truecolor', () => {
      process.env.COLORTERM = 'truecolor';
      assert.equal(getColorDepth(), 8);
    });

    it('should detect 24-bit color when COLORTERM is 24bit', () => {
      process.env.COLORTERM = '24bit';
      assert.equal(getColorDepth(), 8);
    });

    it('should detect 256-color when TERM includes 256color', () => {
      process.env.TERM = 'xterm-256color';
      delete process.env.COLORTERM;
      assert.equal(getColorDepth(), 4);
    });

    it('should detect 256-color when TERM includes 256', () => {
      process.env.TERM = 'rxvt-unicode-256';
      delete process.env.COLORTERM;
      assert.equal(getColorDepth(), 4);
    });

    it('should detect 24-bit for iTerm.app', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      assert.equal(getColorDepth(), 8);
    });

    it('should detect 24-bit for vscode', () => {
      process.env.TERM_PROGRAM = 'vscode';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      assert.equal(getColorDepth(), 8);
    });

    it('should default to 16-color when no color info is available', () => {
      delete process.env.COLORTERM;
      delete process.env.TERM;
      delete process.env.TERM_PROGRAM;
      assert.equal(getColorDepth(), 1);
    });

    it('should respect FORCE_COLOR_DEPTH environment variable', () => {
      process.env.FORCE_COLOR_DEPTH = '1';
      assert.equal(getColorDepth(), 1);

      process.env.FORCE_COLOR_DEPTH = '4';
      resetColorDepthCache();
      assert.equal(getColorDepth(), 4);

      process.env.FORCE_COLOR_DEPTH = '8';
      resetColorDepthCache();
      assert.equal(getColorDepth(), 8);
    });

    it('should ignore invalid FORCE_COLOR_DEPTH values', () => {
      process.env.FORCE_COLOR_DEPTH = '3';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      delete process.env.TERM_PROGRAM;
      assert.equal(getColorDepth(), 1);
    });
  });

  describe('gradient color fallbacks', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
      resetColorDepthCache();
    });

    afterEach(() => {
      process.env = originalEnv;
      resetColorDepthCache();
    });

    describe('red gradient', () => {
      it('should use RGB colors for 24-bit terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        const text = 'test';
        
        assertContains(red1(text), '\u001b[38;2;255;200;200m');
        assertContains(red2(text), '\u001b[38;2;255;180;180m');
        assertContains(red3(text), '\u001b[38;2;255;160;160m');
        assertContains(red4(text), '\u001b[38;2;255;140;140m');
        assertContains(red5(text), '\u001b[38;2;255;120;120m');
        assertContains(red6(text), '\u001b[38;2;255;100;100m');
        assertContains(red7(text), '\u001b[38;2;255;80;80m');
        assertContains(red8(text), '\u001b[38;2;220;50;50m');
      });

      it('should use 256-color palette for 256-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '4';
        const text = 'test';
        
        // Check that 256-color codes are used
        assertContains(red1(text), '\u001b[38;5;217m');
        assertContains(red2(text), '\u001b[38;5;224m');
        assertContains(red3(text), '\u001b[38;5;210m');
        assertContains(red4(text), '\u001b[38;5;203m');
        assertContains(red5(text), '\u001b[38;5;196m');
        assertContains(red6(text), '\u001b[38;5;160m');
        assertContains(red7(text), '\u001b[38;5;124m');
        assertContains(red8(text), '\u001b[38;5;88m');
      });

      it('should fallback to basic colors for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        const text = 'test';
        
        // First 4 should be bright red
        assertContains(red1(text), ANSI.BRIGHT_RED);
        assertContains(red2(text), ANSI.BRIGHT_RED);
        assertContains(red3(text), ANSI.BRIGHT_RED);
        assertContains(red4(text), ANSI.BRIGHT_RED);
        
        // Last 4 should be normal red
        assertContains(red5(text), ANSI.RED);
        assertContains(red6(text), ANSI.RED);
        assertContains(red7(text), ANSI.RED);
        assertContains(red8(text), ANSI.RED);
      });
    });

    describe('blue gradient', () => {
      it('should use RGB colors for 24-bit terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        const text = 'test';
        
        assertContains(blue1(text), '\u001b[38;2;200;200;255m');
        assertContains(blue8(text), '\u001b[38;2;50;50;220m');
      });

      it('should use 256-color palette for 256-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '4';
        const text = 'test';
        
        assertContains(blue1(text), '\u001b[38;5;189m');
        assertContains(blue8(text), '\u001b[38;5;57m');
      });

      it('should fallback to basic colors for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        const text = 'test';
        
        assertContains(blue1(text), ANSI.BRIGHT_BLUE);
        assertContains(blue5(text), ANSI.BLUE);
      });
    });

    describe('green gradient', () => {
      it('should use RGB colors for 24-bit terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        const text = 'test';
        
        assertContains(green1(text), '\u001b[38;2;200;255;200m');
        assertContains(green8(text), '\u001b[38;2;50;180;50m');
      });

      it('should use 256-color palette for 256-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '4';
        const text = 'test';
        
        assertContains(green1(text), '\u001b[38;5;194m');
        assertContains(green8(text), '\u001b[38;5;28m');
      });

      it('should fallback to basic colors for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        const text = 'test';
        
        assertContains(green1(text), ANSI.BRIGHT_GREEN);
        assertContains(green5(text), ANSI.GREEN);
      });
    });

    describe('orange color', () => {
      it('should use 256-color palette for 256-color or better terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        assertContains(orange('test'), '\u001b[38;5;214m');

        process.env.FORCE_COLOR_DEPTH = '4';
        resetColorDepthCache();
        assertContains(orange('test'), '\u001b[38;5;214m');
      });

      it('should fallback to yellow for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        assertContains(orange('test'), ANSI.YELLOW);
      });
    });
  });

  describe('stripAnsi', () => {
    it('should remove ANSI color codes', () => {
      const colored = `${ANSI.RED}test${ANSI.RESET}`;
      assert.equal(stripAnsi(colored), 'test');
    });

    it('should remove 256-color codes', () => {
      const colored = '\u001b[38;5;214mtest\u001b[0m';
      assert.equal(stripAnsi(colored), 'test');
    });

    it('should remove RGB color codes', () => {
      const colored = '\u001b[38;2;255;100;100mtest\u001b[0m';
      assert.equal(stripAnsi(colored), 'test');
    });

    it('should handle multiple color codes', () => {
      const colored = `${ANSI.BOLD}${ANSI.RED}bold red${ANSI.RESET} normal ${ANSI.GREEN}green${ANSI.RESET}`;
      assert.equal(stripAnsi(colored), 'bold red normal green');
    });
  });
});