import React from 'react';
import { DemoApp } from '../bin/demo.tsx';
import { render } from 'ink-testing-library';

describe('Demo CLI Application', () => {

  describe('Demo Component Tests', () => {
    it('should render RPS Sparkline example with realistic data', async () => {
      const { lastFrame } = render(<DemoApp />);
      
      expect(lastFrame()).toContain('RPS');
      expect(lastFrame()).toContain('▁'); // Should contain block symbols
    });

    it('should render BarChart example with categorical data', async () => {
      const { lastFrame } = render(<DemoApp />);
      
      expect(lastFrame()).toContain('Department');
      expect(lastFrame()).toContain('Sales');
      expect(lastFrame()).toContain('Marketing');
      expect(lastFrame()).toContain('Support');
      expect(lastFrame()).toContain('█'); // Should contain bar characters
    });

    it('should demonstrate key features including sorting and thresholds', async () => {
      const { lastFrame } = render(<DemoApp />);
      
      expect(lastFrame()).toContain('Threshold Highlighting');
      expect(lastFrame()).toContain('above 80');
      expect(lastFrame()).toContain('Auto-width');
      expect(lastFrame()).toContain('[91m'); // Should contain ANSI red color codes
    });

    it('should execute via npm run demo without errors', async () => {
      // This test will fail because bin/demo.tsx doesn't exist
      // We can't actually test npm run demo in jest, but we can test that the file exists
      const fs = await import('fs');
      const path = '/Users/takuto/Dev/ink-chart/bin/demo.tsx';
      
      // This will fail until we create the file
      expect(() => {
        return fs.statSync(path);
      }).not.toThrow();
    });

    it('should be executable as npx ink-chart-demo command', async () => {
      // This test ensures the bin entry point works
      // Will fail until bin/demo.js is built from demo.tsx
      const packageJson = await import('../package.json', { assert: { type: 'json' } });
      
      expect(packageJson.default.bin).toBeDefined();
      expect(packageJson.default.bin['ink-chart-demo']).toBe('./bin/demo.js');
      
      // Check that the demo script exists
      const fs = await import('fs');
      
      // This will fail until we build the TypeScript to JavaScript
      expect(() => {
        return fs.statSync('/Users/takuto/Dev/ink-chart/bin/demo.js');
      }).not.toThrow();
    });
  });

  describe('Demo Content Validation', () => {
    it('should use realistic RPS data showing server performance trends', () => {
      const { lastFrame } = render(<DemoApp />);
      
      expect(lastFrame()).toContain('RPS');
      expect(lastFrame()).toContain('Peak:');
      expect(lastFrame()).toContain('Average:');
    });

    it('should use realistic categorical data for BarChart example', () => {
      const { lastFrame } = render(<DemoApp />);
      
      expect(lastFrame()).toContain('Department Performance');
      expect(lastFrame()).toContain('Sales');
      expect(lastFrame()).toContain('Marketing');
      expect(lastFrame()).toContain('Support');
      expect(lastFrame()).toContain('Development');
    });
  });
});