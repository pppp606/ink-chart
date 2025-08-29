/**
 * Creates a normalization function that maps values from a given domain to [0, 1] range.
 * 
 * @param domain - Array representing the input range [min, max]. If empty, treated as [0, 0].
 * @returns A function that normalizes values to [0, 1] range
 */
export function normalize(domain: number[]): (value: number) => number {
  if (domain.length === 0) {
    return () => 0;
  }

  const min = domain[0] ?? 0;
  const max = domain.length === 1 ? domain[0] ?? 0 : domain[1] ?? 0;
  
  if (min === max) {
    return () => 0;
  }
  
  const range = max - min;
  
  return (value: number): number => {
    return (value - min) / range;
  };
}

/**
 * Creates a quantization function that maps values from a domain to discrete integer steps.
 * 
 * @param domain - Array representing the input range [min, max]
 * @param steps - Number of quantization steps (output range will be [0, steps-1])
 * @returns A function that quantizes values to integer steps
 */
export function quantize(domain: number[], steps: number): (value: number) => number {
  if (domain.length === 0) {
    return () => 0;
  }

  const min = domain[0] ?? 0;
  const max = domain.length === 1 ? domain[0] ?? 0 : domain[1] ?? 0;
  
  if (min === max || steps <= 1) {
    return () => 0;
  }
  
  const range = max - min;
  const stepSize = range / steps;
  
  return (value: number): number => {
    const normalized = (value - min) / stepSize;
    const quantized = Math.floor(normalized);
    
    // Special case: clamp values exactly at max to steps-1
    if (value === max) {
      return steps - 1;
    }
    
    return quantized;
  };
}