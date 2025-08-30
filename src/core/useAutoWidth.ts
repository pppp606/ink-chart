import { useState, useEffect, useCallback } from 'react';
import { getSafeTerminalWidth } from './width-utils.js';

/**
 * Return type for the useAutoWidth hook
 */
export interface UseAutoWidthResult {
  /** Current terminal width in characters */
  width: number;
  /** Always true for this hook implementation */
  isAutoWidth: boolean;
}

/**
 * Hook that automatically tracks terminal width changes with debouncing
 * 
 * Provides real-time terminal width information with a 120ms debounce window
 * to prevent excessive re-renders during rapid resize events.
 * 
 * @returns Object containing current width and auto-width indicator
 */
export function useAutoWidth(): UseAutoWidthResult {
  // Get initial width from terminal with margin to prevent wrapping
  const getTerminalWidth = (): number => {
    return getSafeTerminalWidth(process.stdout.columns);
  };

  const [width, setWidth] = useState<number>(getTerminalWidth());

  const updateWidth = useCallback(() => {
    const newWidth = getTerminalWidth();
    setWidth(newWidth);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Clear any existing timeout
      clearTimeout(timeoutId);
      
      // Set new timeout with 120ms debounce
      timeoutId = setTimeout(updateWidth, 120);
    };

    // Listen for terminal resize events
    process.on('SIGWINCH', handleResize);

    // Cleanup function
    return () => {
      process.removeListener('SIGWINCH', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateWidth]);

  return {
    width,
    isAutoWidth: true
  };
}