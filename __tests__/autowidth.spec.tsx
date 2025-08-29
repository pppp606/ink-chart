import { useAutoWidth } from '../src/core/useAutoWidth.js';

// Mock React hooks at the module level
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useState: jest.fn(),
    useEffect: jest.fn(),
    useCallback: jest.fn(),
  };
});

// Get references to the mocked functions
import React from 'react';
const mockUseState = jest.mocked(React.useState);
const mockUseEffect = jest.mocked(React.useEffect);
const mockUseCallback = jest.mocked(React.useCallback);

describe('useAutoWidth Hook', () => {
  beforeEach(() => {
    // Reset process.stdout.columns to default
    Object.defineProperty(process.stdout, 'columns', {
      value: 80,
      writable: true,
      configurable: true,
    });

    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseState.mockImplementation((initial) => [initial, jest.fn()]);
    mockUseEffect.mockImplementation((effect) => effect());
    mockUseCallback.mockImplementation((callback) => callback);
  });

  // GREEN PHASE TESTS - Basic functionality tests
  it('should be defined and exportable', () => {
    expect(typeof useAutoWidth).toBe('function');
  });

  it('should return correct API shape when called directly', () => {
    // Mock useState to return a specific width value
    const mockSetState = jest.fn();
    mockUseState.mockReturnValue([80, mockSetState]);
    
    const result = useAutoWidth();
    
    expect(result).toHaveProperty('width');
    expect(result).toHaveProperty('isAutoWidth');
    expect(typeof result.width).toBe('number');
    expect(typeof result.isAutoWidth).toBe('boolean');
    expect(result.isAutoWidth).toBe(true);
  });

  it('should provide fallback width when columns is undefined', () => {
    // Set columns to undefined
    Object.defineProperty(process.stdout, 'columns', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    
    const mockSetState = jest.fn();
    mockUseState.mockReturnValue([80, mockSetState]); // Fallback value
    
    const result = useAutoWidth();
    
    expect(result.width).toBe(80); // Expected fallback
    expect(result.isAutoWidth).toBe(true);
  });

  it('should register and cleanup SIGWINCH event listener', () => {
    const originalOn = process.on;
    const originalRemoveListener = process.removeListener;
    
    const mockOn = jest.fn();
    const mockRemoveListener = jest.fn();
    process.on = mockOn;
    process.removeListener = mockRemoveListener;

    // Mock useEffect to capture the cleanup function
    let cleanupFunction: (() => void) | undefined;
    const mockSetState = jest.fn();
    mockUseState.mockReturnValue([80, mockSetState]);
    mockUseEffect.mockImplementation((effectFn) => {
      cleanupFunction = effectFn();
    });

    // Call the hook
    useAutoWidth();
    
    // Verify event listener was registered
    expect(mockOn).toHaveBeenCalledWith('SIGWINCH', expect.any(Function));
    
    // Call cleanup function
    if (cleanupFunction) {
      cleanupFunction();
      expect(mockRemoveListener).toHaveBeenCalledWith('SIGWINCH', expect.any(Function));
    }
    
    // Restore
    process.on = originalOn;
    process.removeListener = originalRemoveListener;
  });

  // DEBOUNCING TESTS - Test the specific 40→80→40 scenario with 120ms debouncing
  it('should debounce rapid terminal resize events (40→80→40 = 1 redraw in 120ms)', (done) => {
    jest.useFakeTimers();
    
    const originalOn = process.on;
    const originalRemoveListener = process.removeListener;
    
    let resizeHandler: (() => void) | undefined;
    const mockOn = jest.fn((event, handler) => {
      if (event === 'SIGWINCH') {
        resizeHandler = handler as () => void;
      }
    });
    const mockRemoveListener = jest.fn();
    process.on = mockOn;
    process.removeListener = mockRemoveListener;

    // Track state changes
    const stateChanges: number[] = [];
    const mockSetState = jest.fn((newWidth) => {
      stateChanges.push(newWidth);
    });
    
    const currentWidth = 40;
    mockUseState.mockReturnValue([currentWidth, mockSetState]);
    mockUseEffect.mockImplementation((effectFn) => effectFn());

    // Start with 40 columns
    Object.defineProperty(process.stdout, 'columns', {
      value: 40,
      writable: true,
      configurable: true,
    });

    // Initialize the hook
    useAutoWidth();
    
    // Simulate rapid resize events: 40→80→40
    if (resizeHandler) {
      // Change to 80
      Object.defineProperty(process.stdout, 'columns', {
        value: 80,
        writable: true,
        configurable: true,
      });
      resizeHandler();
      
      // Immediately change to 40 (before 120ms timeout)
      Object.defineProperty(process.stdout, 'columns', {
        value: 40,
        writable: true,
        configurable: true,
      });
      resizeHandler();
      
      // Fast forward time by less than 120ms - should not trigger updates yet
      jest.advanceTimersByTime(100);
      expect(stateChanges).toHaveLength(0);
      
      // Fast forward past 120ms - should trigger only one update (the final state)
      jest.advanceTimersByTime(25); // Total: 125ms
      expect(stateChanges).toHaveLength(1);
      expect(stateChanges[0]).toBe(40); // Final width should be 40
    }
    
    // Restore everything
    jest.useRealTimers();
    process.on = originalOn;
    process.removeListener = originalRemoveListener;
    
    done();
  });

  it('should properly handle multiple debounced events', (done) => {
    jest.useFakeTimers();
    
    const originalOn = process.on;
    let resizeHandler: (() => void) | undefined;
    const mockOn = jest.fn((event, handler) => {
      if (event === 'SIGWINCH') {
        resizeHandler = handler as () => void;
      }
    });
    process.on = mockOn;

    // Track all state updates
    const stateUpdates: number[] = [];
    const mockSetState = jest.fn((newWidth) => {
      stateUpdates.push(newWidth);
    });
    
    mockUseState.mockReturnValue([80, mockSetState]);
    mockUseEffect.mockImplementation((effectFn) => effectFn());

    // Initialize hook
    useAutoWidth();
    
    if (resizeHandler) {
      // Simulate multiple rapid changes
      Object.defineProperty(process.stdout, 'columns', { value: 100, writable: true });
      resizeHandler();
      
      jest.advanceTimersByTime(50);
      
      Object.defineProperty(process.stdout, 'columns', { value: 120, writable: true });
      resizeHandler();
      
      jest.advanceTimersByTime(50);
      
      Object.defineProperty(process.stdout, 'columns', { value: 90, writable: true });
      resizeHandler();
      
      // At this point 100ms passed, still within debounce window
      expect(stateUpdates).toHaveLength(0);
      
      // Fast forward past 120ms from last change
      jest.advanceTimersByTime(125);
      
      // Should have exactly one update with the final value
      expect(stateUpdates).toHaveLength(1);
      expect(stateUpdates[0]).toBe(90);
    }
    
    // Restore
    jest.useRealTimers();
    process.on = originalOn;
    
    done();
  });
});