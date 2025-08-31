import {
  getColorDepth,
  resetColorDepthCache,
  red1, red2, red3, red4, red5, red6, red7, red8,
  blue1, blue5, blue8,
  green1, green5, green8,
  orange,
  stripAnsi,
  ANSI,
} from '../ansi';

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
      expect(getColorDepth()).toBe(8);
    });

    it('should detect 24-bit color when COLORTERM is 24bit', () => {
      process.env.COLORTERM = '24bit';
      expect(getColorDepth()).toBe(8);
    });

    it('should detect 256-color when TERM includes 256color', () => {
      process.env.TERM = 'xterm-256color';
      delete process.env.COLORTERM;
      expect(getColorDepth()).toBe(4);
    });

    it('should detect 256-color when TERM includes 256', () => {
      process.env.TERM = 'rxvt-unicode-256';
      delete process.env.COLORTERM;
      expect(getColorDepth()).toBe(4);
    });

    it('should detect 24-bit for iTerm.app', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      expect(getColorDepth()).toBe(8);
    });

    it('should detect 24-bit for vscode', () => {
      process.env.TERM_PROGRAM = 'vscode';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      expect(getColorDepth()).toBe(8);
    });

    it('should default to 16-color when no color info is available', () => {
      delete process.env.COLORTERM;
      delete process.env.TERM;
      delete process.env.TERM_PROGRAM;
      expect(getColorDepth()).toBe(1);
    });

    it('should respect FORCE_COLOR_DEPTH environment variable', () => {
      process.env.FORCE_COLOR_DEPTH = '1';
      expect(getColorDepth()).toBe(1);

      process.env.FORCE_COLOR_DEPTH = '4';
      resetColorDepthCache();
      expect(getColorDepth()).toBe(4);

      process.env.FORCE_COLOR_DEPTH = '8';
      resetColorDepthCache();
      expect(getColorDepth()).toBe(8);
    });

    it('should ignore invalid FORCE_COLOR_DEPTH values', () => {
      process.env.FORCE_COLOR_DEPTH = '3';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      delete process.env.TERM_PROGRAM;
      expect(getColorDepth()).toBe(1);
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
        
        expect(red1(text)).toContain('\u001b[38;2;255;200;200m');
        expect(red2(text)).toContain('\u001b[38;2;255;180;180m');
        expect(red3(text)).toContain('\u001b[38;2;255;160;160m');
        expect(red4(text)).toContain('\u001b[38;2;255;140;140m');
        expect(red5(text)).toContain('\u001b[38;2;255;120;120m');
        expect(red6(text)).toContain('\u001b[38;2;255;100;100m');
        expect(red7(text)).toContain('\u001b[38;2;255;80;80m');
        expect(red8(text)).toContain('\u001b[38;2;220;50;50m');
      });

      it('should use 256-color palette for 256-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '4';
        const text = 'test';
        
        // Check that 256-color codes are used
        expect(red1(text)).toContain('\u001b[38;5;217m');
        expect(red2(text)).toContain('\u001b[38;5;224m');
        expect(red3(text)).toContain('\u001b[38;5;210m');
        expect(red4(text)).toContain('\u001b[38;5;203m');
        expect(red5(text)).toContain('\u001b[38;5;196m');
        expect(red6(text)).toContain('\u001b[38;5;160m');
        expect(red7(text)).toContain('\u001b[38;5;124m');
        expect(red8(text)).toContain('\u001b[38;5;88m');
      });

      it('should fallback to basic colors for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        const text = 'test';
        
        // First 4 should be bright red
        expect(red1(text)).toContain(ANSI.BRIGHT_RED);
        expect(red2(text)).toContain(ANSI.BRIGHT_RED);
        expect(red3(text)).toContain(ANSI.BRIGHT_RED);
        expect(red4(text)).toContain(ANSI.BRIGHT_RED);
        
        // Last 4 should be normal red
        expect(red5(text)).toContain(ANSI.RED);
        expect(red6(text)).toContain(ANSI.RED);
        expect(red7(text)).toContain(ANSI.RED);
        expect(red8(text)).toContain(ANSI.RED);
      });
    });

    describe('blue gradient', () => {
      it('should use RGB colors for 24-bit terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        const text = 'test';
        
        expect(blue1(text)).toContain('\u001b[38;2;200;200;255m');
        expect(blue8(text)).toContain('\u001b[38;2;50;50;220m');
      });

      it('should use 256-color palette for 256-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '4';
        const text = 'test';
        
        expect(blue1(text)).toContain('\u001b[38;5;189m');
        expect(blue8(text)).toContain('\u001b[38;5;57m');
      });

      it('should fallback to basic colors for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        const text = 'test';
        
        expect(blue1(text)).toContain(ANSI.BRIGHT_BLUE);
        expect(blue5(text)).toContain(ANSI.BLUE);
      });
    });

    describe('green gradient', () => {
      it('should use RGB colors for 24-bit terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        const text = 'test';
        
        expect(green1(text)).toContain('\u001b[38;2;200;255;200m');
        expect(green8(text)).toContain('\u001b[38;2;50;180;50m');
      });

      it('should use 256-color palette for 256-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '4';
        const text = 'test';
        
        expect(green1(text)).toContain('\u001b[38;5;194m');
        expect(green8(text)).toContain('\u001b[38;5;28m');
      });

      it('should fallback to basic colors for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        const text = 'test';
        
        expect(green1(text)).toContain(ANSI.BRIGHT_GREEN);
        expect(green5(text)).toContain(ANSI.GREEN);
      });
    });

    describe('orange color', () => {
      it('should use 256-color palette for 256-color or better terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '8';
        expect(orange('test')).toContain('\u001b[38;5;214m');

        process.env.FORCE_COLOR_DEPTH = '4';
        resetColorDepthCache();
        expect(orange('test')).toContain('\u001b[38;5;214m');
      });

      it('should fallback to yellow for 16-color terminals', () => {
        process.env.FORCE_COLOR_DEPTH = '1';
        expect(orange('test')).toContain(ANSI.YELLOW);
      });
    });
  });

  describe('stripAnsi', () => {
    it('should remove ANSI color codes', () => {
      const colored = `${ANSI.RED}test${ANSI.RESET}`;
      expect(stripAnsi(colored)).toBe('test');
    });

    it('should remove 256-color codes', () => {
      const colored = '\u001b[38;5;214mtest\u001b[0m';
      expect(stripAnsi(colored)).toBe('test');
    });

    it('should remove RGB color codes', () => {
      const colored = '\u001b[38;2;255;100;100mtest\u001b[0m';
      expect(stripAnsi(colored)).toBe('test');
    });

    it('should handle multiple color codes', () => {
      const colored = `${ANSI.BOLD}${ANSI.RED}bold red${ANSI.RESET} normal ${ANSI.GREEN}green${ANSI.RESET}`;
      expect(stripAnsi(colored)).toBe('bold red normal green');
    });
  });
});