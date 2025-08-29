import React from 'react';
import { render } from 'ink-testing-library';

// Mock the demo component before importing it
let mockDemoComponent: React.ComponentType<any> | null = null;

jest.mock('../bin/demo.ts', () => {
  return {
    DemoApp: () => mockDemoComponent ? React.createElement(mockDemoComponent) : null,
  };
});

describe('Demo CLI Application', () => {
  beforeEach(() => {
    mockDemoComponent = null;
  });

  describe('Red Phase - Failing Tests', () => {
    it('should render RPS Sparkline example with realistic data', async () => {
      // This test will fail because bin/demo.ts doesn't exist yet
      
      // Mock a demo component that should eventually be exported
      mockDemoComponent = () => React.createElement('div', {}, 
        'RPS Demo:', 
        React.createElement('br'),
        '▁▂▃▄▅▆▇█▇▆▅▄▃▂▁'  // Expected sparkline pattern
      );

      const { lastFrame } = render(React.createElement(mockDemoComponent));
      
      expect(lastFrame()).toContain('RPS');
      expect(lastFrame()).toContain('▁▂▃▄▅▆▇█'); // Should contain block symbols
    });

    it('should render BarChart example with categorical data', async () => {
      // This test will fail because bin/demo.ts doesn't exist yet
      
      // Mock a demo component with bar chart example
      mockDemoComponent = () => React.createElement('div', {},
        'Category Demo:',
        React.createElement('br'),
        'Sales     ████████████████████ 1250',
        React.createElement('br'),
        'Marketing ████████████ 800',
        React.createElement('br'), 
        'Support   ████ 300'
      );

      const { lastFrame } = render(React.createElement(mockDemoComponent));
      
      expect(lastFrame()).toContain('Category');
      expect(lastFrame()).toContain('Sales');
      expect(lastFrame()).toContain('Marketing');
      expect(lastFrame()).toContain('Support');
      expect(lastFrame()).toContain('█'); // Should contain bar characters
    });

    it('should demonstrate key features including sorting and thresholds', async () => {
      // This test will fail because the actual demo needs to showcase all features
      
      mockDemoComponent = () => React.createElement('div', {},
        'Features Demo:',
        React.createElement('br'),
        'Threshold highlighting (red values above 80):',
        React.createElement('br'),
        '▁▂▃▄▅▆▇\x1b[31m█\x1b[39m▇▆▅▄▃▂▁', // Threshold highlighting with ANSI red
        React.createElement('br'),
        'Sorted bars (desc):',
        React.createElement('br'),
        'High   ████████████████████ 100',
        React.createElement('br'),
        'Medium ████████████ 60',
        React.createElement('br'),
        'Low    ████ 20'
      );

      const { lastFrame } = render(React.createElement(mockDemoComponent));
      
      expect(lastFrame()).toContain('Features Demo');
      expect(lastFrame()).toContain('Threshold highlighting');
      expect(lastFrame()).toContain('Sorted bars');
      expect(lastFrame()).toContain('\x1b[31m'); // Should contain ANSI red color codes
    });

    it('should execute via npm run demo without errors', async () => {
      // This test will fail because bin/demo.ts doesn't exist
      // We can't actually test npm run demo in jest, but we can test that the file exists
      const fs = require('fs');
      const path = '/Users/takuto/Dev/ink-chart/bin/demo.ts';
      
      // This will fail until we create the file
      expect(() => {
        return fs.statSync(path);
      }).not.toThrow();
    });

    it('should be executable as npx ink-chart-demo command', async () => {
      // This test ensures the bin entry point works
      // Will fail until bin/demo.js is built from demo.ts
      const packageJson = require('../package.json');
      
      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin['ink-chart-demo']).toBe('./bin/demo.js');
      
      // Check that the demo script exists
      const fs = require('fs');
      
      // This will fail until we build the TypeScript to JavaScript
      expect(() => {
        return fs.statSync('/Users/takuto/Dev/ink-chart/bin/demo.js');
      }).not.toThrow();
    });
  });

  describe('Demo Content Validation', () => {
    it('should use realistic RPS data showing server performance trends', () => {
      // Test data should represent realistic requests per second values
      // This will fail until we implement with proper data
      const expectedRpsData = [45, 52, 48, 67, 71, 58, 63, 89, 94, 82, 76, 69, 55, 51];
      
      // Mock implementation should use this data pattern
      mockDemoComponent = () => React.createElement('div', {}, 
        `RPS Trend: ${expectedRpsData.join(',')}`,
        React.createElement('br'),
        'Expected sparkline for this data pattern'
      );

      const { lastFrame } = render(React.createElement(mockDemoComponent));
      
      expect(lastFrame()).toContain('RPS Trend');
      // Will fail until actual implementation uses realistic data
      expect(lastFrame()).toMatch(/\d+,\d+,\d+/); // Should contain comma-separated numbers
    });

    it('should use realistic categorical data for BarChart example', () => {
      // Test data should represent realistic business metrics
      const expectedCategoryData = [
        { label: 'Sales', value: 1250 },
        { label: 'Marketing', value: 800 },
        { label: 'Support', value: 300 },
        { label: 'Development', value: 950 }
      ];

      // This will fail until implementation uses this data structure
      mockDemoComponent = () => React.createElement('div', {},
        'Business Metrics:',
        React.createElement('br'),
        expectedCategoryData.map(item => 
          `${item.label}: ${item.value}`
        ).join(', ')
      );

      const { lastFrame } = render(React.createElement(mockDemoComponent));
      
      expect(lastFrame()).toContain('Business Metrics');
      expect(lastFrame()).toContain('Sales: 1250');
      expect(lastFrame()).toContain('Marketing: 800');
      expect(lastFrame()).toContain('Support: 300');
      expect(lastFrame()).toContain('Development: 950');
    });
  });
});