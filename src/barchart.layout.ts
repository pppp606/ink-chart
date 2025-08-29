/**
 * Configuration for bar chart layout calculation
 */
export interface LayoutConfig {
  /** Total available width for the entire bar chart */
  totalWidth: number;
  /** Desired width for the label section */
  labelWidth: number;
  /** Desired width for the value section */
  valueWidth: number;
  /** Minimum required width for the bar section */
  minBarWidth: number;
}

/**
 * Result of layout calculation
 */
export interface LayoutResult {
  /** Allocated width for the label section */
  labelWidth: number;
  /** Allocated width for the bar section */
  barWidth: number;
  /** Allocated width for the value section */
  valueWidth: number;
}

/**
 * Calculates optimal layout for a bar chart with intelligent space allocation.
 * 
 * The algorithm prioritizes bar width (respects minBarWidth), then allocates
 * remaining space proportionally to label and value sections.
 * 
 * @param config - Layout configuration
 * @returns Calculated layout with allocated widths
 */
export function calculateLayout(config: LayoutConfig): LayoutResult {
  const { totalWidth, labelWidth: requestedLabelWidth, valueWidth: requestedValueWidth, minBarWidth } = config;
  
  // Handle edge cases
  if (totalWidth <= 0) {
    return {
      labelWidth: 0,
      barWidth: 0,
      valueWidth: 0
    };
  }
  
  // If total requested width fits perfectly, use it
  const totalRequested = requestedLabelWidth + requestedValueWidth + minBarWidth;
  if (totalRequested <= totalWidth) {
    const remainingWidth = totalWidth - requestedLabelWidth - requestedValueWidth;
    return {
      labelWidth: requestedLabelWidth,
      barWidth: remainingWidth,
      valueWidth: requestedValueWidth
    };
  }
  
  // Need to adjust allocations
  
  // First, try to satisfy minimum bar width
  if (minBarWidth >= totalWidth) {
    // Can't even fit minimum bar width
    return {
      labelWidth: 0,
      barWidth: totalWidth,
      valueWidth: 0
    };
  }
  
  // Allocate minimum bar width, distribute remaining space
  const remainingWidthAfterBar = totalWidth - minBarWidth;
  
  if (remainingWidthAfterBar <= 0) {
    return {
      labelWidth: 0,
      barWidth: totalWidth,
      valueWidth: 0
    };
  }
  
  // Distribute remaining space proportionally between label and value
  const totalRequestedLabelValue = requestedLabelWidth + requestedValueWidth;
  
  if (totalRequestedLabelValue === 0) {
    return {
      labelWidth: 0,
      barWidth: totalWidth,
      valueWidth: 0
    };
  }
  
  // Calculate proportional allocation
  const labelRatio = requestedLabelWidth / totalRequestedLabelValue;
  
  // Allocate remaining width proportionally, ensuring we use all space
  const allocatedLabelWidth = Math.floor(remainingWidthAfterBar * labelRatio);
  const allocatedValueWidth = remainingWidthAfterBar - allocatedLabelWidth; // Give remainder to value to use all space
  
  return {
    labelWidth: allocatedLabelWidth,
    barWidth: minBarWidth,
    valueWidth: allocatedValueWidth
  };
}