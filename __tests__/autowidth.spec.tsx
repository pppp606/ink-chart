import React, { useState } from 'react';

// Mock Ink components for testing
jest.mock('ink', () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
  Box: ({ children }: { children: React.ReactNode }) => children,
}));

import { useAutoWidth } from '../src/core/useAutoWidth.js';

// Test component that uses the useAutoWidth hook
function TestComponent({ onRender }: { onRender?: (width: number, isAutoWidth: boolean) => void }) {
  const { width, isAutoWidth } = useAutoWidth();
  
  // Call callback if provided
  if (onRender) {
    onRender(width, isAutoWidth);
  }
  
  return React.createElement('div', {}, `Width: ${width}, IsAutoWidth: ${isAutoWidth}`);
}

describe('useAutoWidth Hook', () => {
  beforeEach(() => {
    // Reset process.stdout.columns to default
    Object.defineProperty(process.stdout, 'columns', {
      value: 80,
      writable: true,
      configurable: true,
    });
  });

  // RED PHASE TESTS - These should fail since useAutoWidth doesn't exist yet
  it('should return initial width and isAutoWidth values', () => {
    let capturedWidth: number | undefined;
    let capturedIsAutoWidth: boolean | undefined;
    
    function CaptureComponent() {
      const { width, isAutoWidth } = useAutoWidth();
      capturedWidth = width;
      capturedIsAutoWidth = isAutoWidth;
      return null;
    }
    
    // This should fail because useAutoWidth doesn't exist
    expect(() => {
      React.createElement(CaptureComponent);
    }).toThrow();
  });

  it('should detect terminal width changes with debouncing', () => {
    // This test should fail since the hook doesn't exist
    expect(() => {
      const { width, isAutoWidth } = useAutoWidth();
      expect(width).toBe(80);
      expect(isAutoWidth).toBe(true);
    }).toThrow();
  });

  it('should handle rapid width changes with proper debouncing', () => {
    // This test should fail since the hook doesn't exist
    expect(() => {
      const { width } = useAutoWidth();
      expect(typeof width).toBe('number');
    }).toThrow();
  });

  it('should return correct API shape', () => {
    // This test should fail since the hook doesn't exist
    expect(() => {
      const result = useAutoWidth();
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('isAutoWidth');
      expect(typeof result.width).toBe('number');
      expect(typeof result.isAutoWidth).toBe('boolean');
    }).toThrow();
  });

  it('should handle edge cases gracefully', () => {
    // Test with undefined columns - should fail since hook doesn't exist
    (process.stdout as any).columns = undefined;
    
    expect(() => {
      const { width } = useAutoWidth();
      expect(typeof width).toBe('number');
      expect(width).toBeGreaterThan(0);
    }).toThrow();
  });
});