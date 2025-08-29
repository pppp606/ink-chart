#!/usr/bin/env npx tsx

/**
 * Demo CLI application for ink-chart components
 * 
 * This demo showcases both Sparkline and BarChart components with realistic
 * data examples that demonstrate key features like auto-scaling, sorting,
 * threshold highlighting, and value positioning.
 */

import React from 'react';
import { render, Box, Text } from 'ink';
import { Sparkline, BarChart, BarChartData } from '../src/index.js';

/**
 * Generate realistic RPS (Requests Per Second) data
 * Simulates server performance metrics over time
 */
function generateRpsData(): number[] {
  // Realistic RPS data showing daily server load pattern
  // Values represent requests per second throughout a day
  return [45, 52, 48, 67, 71, 58, 63, 89, 94, 82, 76, 69, 55, 51, 
          48, 44, 39, 42, 38, 35, 41, 47, 52, 58];
}

/**
 * Generate realistic business category data  
 * Represents different department performance metrics
 */
function generateCategoryData(): BarChartData[] {
  return [
    { label: 'Sales', value: 1250 },
    { label: 'Marketing', value: 800 },
    { label: 'Support', value: 300 },
    { label: 'Development', value: 950 },
    { label: 'Operations', value: 650 }
  ];
}

/**
 * Generate threshold demonstration data
 * Shows values that exceed multiple performance thresholds for gradient highlighting
 */
function generateThresholdData(): number[] {
  // Values that cross multiple thresholds (60, 75, 85) for gradient demonstration
  return [45, 60, 75, 85, 92, 78, 83, 95, 88, 72, 65, 58, 68, 82, 91, 55];
}

/**
 * Main demo application component
 */
export function DemoApp(): React.ReactElement {
  const rpsData = generateRpsData();
  const categoryData = generateCategoryData();
  const thresholdData = generateThresholdData();

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">🚀 ink-chart Demo - Interactive Terminal Charts</Text>
      <Text> </Text>
      
      {/* Sparkline RPS Example */}
      <Text bold color="yellow">📈 Sparkline Example: Server RPS Over 24 Hours</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Sparkline 
          data={rpsData}
          width={40}
          mode="block"
          caption="Requests per second (24h trend)"
        />
        <Text dim>Peak: {Math.max(...rpsData)} RPS | Average: {Math.round(rpsData.reduce((a,b) => a+b) / rpsData.length)} RPS</Text>
      </Box>
      <Text> </Text>

      {/* BarChart Category Example */}
      <Text bold color="yellow">📊 BarChart Example: Department Performance</Text>
      <Box flexDirection="column" marginLeft={2}>
        <BarChart 
          data={categoryData}
          sort="desc"
          showValue="right"
          width={60}
          format={(value) => `${value}`}
        />
      </Box>
      <Text> </Text>

      {/* Threshold Highlighting Demo */}
      <Text bold color="yellow">🎯 Gradient Threshold Demo</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text>Gradient: Light Red (60+) → Medium Red (75+) → Dark Red (85+)</Text>
        <Sparkline 
          data={thresholdData}
          width={50}
          threshold={[60, 75, 85]}
          mode="block"
          caption="Performance metrics with gradient highlighting"
        />
      </Box>
      <Text> </Text>

      {/* Max Width Demo */}
      <Text bold color="yellow">📏 Max Width Feature Demo</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text>Sparkline with full terminal width:</Text>
        <Sparkline 
          data={[10, 20, 15, 25, 30, 18, 22, 12, 16, 24, 28, 22, 19, 14]}
          width="max"
          mode="block"
          caption="Full terminal width"
        />
      </Box>
      <Text> </Text>

      {/* Custom Formatting Demo */}
      <Text bold color="yellow">💰 Custom Value Formatting</Text>
      <Box flexDirection="column" marginLeft={2}>
        <BarChart 
          data={[
            { label: 'Q1 Revenue', value: 125000 },
            { label: 'Q2 Revenue', value: 180000 },
            { label: 'Q3 Revenue', value: 145000 },
            { label: 'Q4 Revenue', value: 220000 }
          ]}
          sort="none"
          showValue="right"
          width={55}
          format={(value) => `$${(value/1000)}K`}
          barChar="▓"
        />
      </Box>
      <Text> </Text>

      <Text dim>💡 Try resizing your terminal to see auto-width in action!</Text>
      <Text dim>⚡ Use these components in your own CLI applications!</Text>
    </Box>
  );
}

/**
 * Entry point for the demo application
 */
export function main() {
  render(<DemoApp />);
}

// Auto-run when executed directly
main();