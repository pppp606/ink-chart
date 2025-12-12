#!/usr/bin/env node

/**
 * Demo CLI application for ink-chart components
 * 
 * This demo showcases both Sparkline and BarChart components with realistic
 * data examples that demonstrate key features like auto-scaling, sorting,
 * threshold highlighting, and value positioning.
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import { Sparkline, BarChart, BarChartData, StackedBarChart, LineGraph } from '../src/index.js';

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
 * Shows values that exceed multiple performance thresholds for smooth gradient highlighting
 */
function generateThresholdData(): number[] {
  // Values that cross 8-level thresholds for smooth gradient demonstration
  return [45, 55, 60, 65, 70, 75, 80, 85, 90, 95, 88, 82, 77, 72, 68, 62, 58, 52];
}

/**
 * Dynamic sparkline demo with simulated data
 */
function DynamicSparklineDemo() {
  const [rpsHistory, setRpsHistory] = useState<number[]>([45, 52, 48, 67, 71, 58, 63, 89, 94, 82, 76, 69, 55, 51, 48, 44, 39, 42, 38, 35, 41, 47, 52, 58]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRpsHistory(prev => {
        const newValue = 40 + Math.random() * 60; // 40-100 RPS
        const newHistory = [...prev.slice(1), newValue]; // Rolling window
        return newHistory;
      });
    }, 1500); // Update every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      <Text>Live RPS Trend (rolling window):</Text>
      <Sparkline 
        data={rpsHistory}
        width={50}
        mode="block"
        threshold={[60, 70, 80, 90]}
        colorScheme="blue"
      />
      <Text dimColor>Current: {rpsHistory[rpsHistory.length - 1]?.toFixed(0)} RPS | Peak: {Math.max(...rpsHistory).toFixed(0)} RPS</Text>
      <Text> </Text>
    </Box>
  );
}

/**
 * Dynamic system stats demo with simulated data
 */
function DynamicSystemDemo() {
  const [memoryUsage, setMemoryUsage] = useState(72.3);
  const [cpuData, setCpuData] = useState([
    { label: 'Chrome', value: 28.5, color: '#a61d24' },
    { label: 'VS Code', value: 15.2, color: '#4aaa1a' },
    { label: 'Slack', value: 8.7, color: '#d89612' },
    { label: 'Terminal', value: 3.1, color: '#4aaa1a' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate realistic memory fluctuation
      setMemoryUsage(prev => {
        const variation = (Math.random() - 0.5) * 2;
        const newValue = prev + variation;
        return Math.max(68, Math.min(78, newValue));
      });

      // Simulate realistic CPU usage changes
      setCpuData(prev => prev.map(process => ({
        ...process,
        value: Math.max(0.1, Math.min(35, 
          process.value + (Math.random() - 0.5) * 3
        ))
      })));
    }, 3000); // 3 second intervals

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" height={8}>
      <Text>Memory: {memoryUsage.toFixed(1)}%</Text>
      <BarChart 
        data={[{ label: 'RAM Used', value: memoryUsage, color: '#d89612' }]}
        width={50}
        max={100}
        showValue="right"
        format={(value) => `${value.toFixed(1)}%`}
      />
      <Text> </Text>
      <Text>CPU by Process:</Text>
      <Box height={4}>
        <BarChart 
          data={cpuData}
          width={50}
          showValue="right"
          format={(value) => `${value.toFixed(1)}%`}
        />
      </Box>
    </Box>
  );
}




/**
 * Static demo - all chart examples without updates
 */
function StaticDemo(): React.ReactElement {
  const rpsData = generateRpsData();
  const categoryData = generateCategoryData();
  const thresholdData = generateThresholdData();

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">🚀 ink-chart Demo - Static Examples</Text>
      <Text dimColor>Press &apos;q&apos; + Enter to quit or Ctrl+C</Text>
      <Text> </Text>
      
      {/* Sparkline RPS Example */}
      <Text bold color="yellow">📈 Sparkline Example: Server RPS Over 24 Hours</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Sparkline 
          data={rpsData}
          width={50}
          mode="block"
          caption="Requests per second (24h trend)"
        />
        <Text dimColor>Peak: {Math.max(...rpsData)} RPS | Average: {Math.round(rpsData.reduce((a,b) => a+b) / rpsData.length)} RPS</Text>
      </Box>
      <Text> </Text>

      {/* Color Gradient Demo */}
      <Text bold color="yellow">🎨 Sparkline Gradient Color Schemes</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text>8-level gradients (55, 62, 68, 74, 79, 84, 89, 94):</Text>
        <Text> </Text>
        <Text>Red:   </Text>
        <Sparkline 
          data={thresholdData}
          width={50}
          threshold={[55, 62, 68, 74, 79, 84, 89, 94]}
          colorScheme="red"
          mode="block"
        />
        <Text>Blue:  </Text>
        <Sparkline 
          data={thresholdData}
          width={50}
          threshold={[55, 62, 68, 74, 79, 84, 89, 94]}
          colorScheme="blue"
          mode="block"
        />
        <Text>Green: </Text>
        <Sparkline 
          data={thresholdData}
          width={50}
          threshold={[55, 62, 68, 74, 79, 84, 89, 94]}
          colorScheme="green"
          mode="block"
        />
      </Box>
      <Text> </Text>

      {/* BarChart Category Example */}
      <Text bold color="yellow">📊 BarChart Example: Department Performance</Text>
      <Box flexDirection="column" marginLeft={2}>
        <BarChart 
          data={categoryData}
          sort="desc"
          showValue="right"
          width={50}
          format={(value) => `${value}`}
        />
      </Box>
      <Text> </Text>

      {/* Colored BarChart Demo */}
      <Text bold color="yellow">🎨 BarChart Multi-Color Example</Text>
      <Box flexDirection="column" marginLeft={2}>
        <BarChart
          data={[
            { label: 'Success', value: 22, color: '#4aaa1a' },
            { label: 'Warnings', value: 8, color: '#d89612' },
            { label: 'Errors', value: 15, color: '#a61d24' }
          ]}
          sort="none"
          showValue="right"
          width={50}
        />
      </Box>
      <Text> </Text>

      {/* BarChart Character Styles */}
      <Text bold color="yellow">📊 BarChart Character Styles</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text dimColor>Different bar characters for visual variety</Text>
        <BarChart
          data={[
            { label: 'API', value: 85, char: '▆' },
            { label: 'DB', value: 65, char: '▓' },
            { label: 'Cache', value: 92, char: '▒' }
          ]}
          sort="none"
          showValue="right"
          width={45}
          max={100}
        />
      </Box>
      <Text> </Text>

      {/* StackedBarChart Example */}
      <Text bold color="yellow">📊 StackedBarChart Example: Distribution</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text dimColor>100% stacked bar showing percentage distribution</Text>
        <StackedBarChart
          data={[
            { label: 'Sales', value: 30, color: '#4aaa1a' },
            { label: 'Warning', value: 20, color: '#d89612' },
            { label: 'Error', value: 50, color: '#a61d24' }
          ]}
          width={50}
        />
      </Box>
      <Text> </Text>

      {/* StackedBarChart Example 2 */}
      <Text bold color="yellow">🎯 StackedBarChart: Project Time Allocation</Text>
      <Box flexDirection="column" marginLeft={2}>
        <StackedBarChart
          data={[
            { label: 'Development', value: 45, color: '#1890ff' },
            { label: 'Testing', value: 25, color: '#52c41a' },
            { label: 'Planning', value: 15, color: '#faad14' },
            { label: 'Meetings', value: 15, color: '#f5222d' }
          ]}
          width={60}
          format={(v) => `${v.toFixed(0)}%`}
        />
      </Box>
      <Text> </Text>

      {/* StackedBarChart Absolute Mode Example */}
      <Text bold color="yellow">📈 StackedBarChart (Absolute Mode): Server Resources</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text dimColor>Showing absolute values (out of 100 max)</Text>
        <StackedBarChart
          data={[
            { label: 'CPU', value: 45, color: '#1890ff' },
            { label: 'Memory', value: 30, color: '#52c41a' },
            { label: 'Disk', value: 15, color: '#faad14' }
          ]}
          mode="absolute"
          max={100}
          width={60}
          format={(v, mode) => mode === 'percentage' ? `${v.toFixed(1)}%` : `${v.toFixed(0)}`}
        />
      </Box>
      <Text> </Text>

      {/* LineGraph Example */}
      <Text bold color="yellow">📉 LineGraph: Temperature Trend</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text dimColor>High-resolution with 3 vertical levels per row (‾ ─ _)</Text>
        <LineGraph
          data={[15, 18, 22, 25, 28, 32, 35, 33, 30, 26, 22, 18]}
          width={40}
          height={6}
          color="cyan"
          caption="Monthly temperature (°C)"
        />
      </Box>
      <Text> </Text>

      {/* LineGraph with Y-Axis */}
      <Text bold color="yellow">📉 LineGraph with Y-Axis: Stock Price</Text>
      <Box flexDirection="column" marginLeft={2}>
        <LineGraph
          data={[100, 105, 98, 110, 115, 108, 120, 125, 118, 130]}
          width={50}
          height={5}
          showYAxis={true}
          color="green"
        />
      </Box>
    </Box>
  );
}

/**
 * Dynamic demo - live updating charts
 */
function DynamicDemo(): React.ReactElement {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">🚀 ink-chart Demo - Live Charts</Text>
      <Text dimColor>Press &apos;q&apos; + Enter to quit or Ctrl+C</Text>
      <Text> </Text>

      {/* Dynamic Sparkline */}
      <Text bold color="yellow">📈 Live RPS Trend</Text>
      <Box flexDirection="column" marginLeft={2}>
        <DynamicSparklineDemo />
      </Box>

      {/* Dynamic BarChart */}
      <Text bold color="yellow">⚡ Live System Stats</Text>
      <Box flexDirection="column" marginLeft={2}>
        <DynamicSystemDemo />
      </Box>
    </Box>
  );
}

/**
 * Entry point functions for different demo modes
 */
export function staticDemo() {
  const { unmount } = render(<StaticDemo />);
  setupExitHandling(unmount);
}

export function dynamicDemo() {
  const { unmount } = render(<DynamicDemo />);
  setupExitHandling(unmount);
}

/**
 * Setup exit handling for both demos
 */
function setupExitHandling(unmount: () => void) {
  // Set up stdin for input handling without raw mode
  if (process.stdin.isTTY) {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'q' || input === 'quit' || input === 'exit') {
        unmount();
        process.exit(0);
      }
    });
  }
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    unmount();
    process.exit(0);
  });
}

/**
 * Main entry point - defaults to static demo
 */
export function main() {
  staticDemo();
}

// Auto-run when executed directly
main();