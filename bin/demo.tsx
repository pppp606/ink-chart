#!/usr/bin/env node

/**
 * Demo CLI application for ink-chart components
 *
 * This demo showcases both Sparkline and BarChart components with realistic
 * data examples that demonstrate key features like auto-scaling, sorting,
 * threshold highlighting, and value positioning.
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, Newline } from 'ink';

// Prevent MaxListenersExceededWarning from ink's SIGWINCH handlers
process.setMaxListeners(20);
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
 * Horizontal divider component
 */
function Divider(): React.ReactElement {
  return (
    <Box
      borderStyle={{
        topLeft: '',
        top: '',
        topRight: '',
        left: '',
        bottomLeft: '',
        bottom: '─',
        bottomRight: '',
        right: ''
      }}
      borderDimColor
      marginBottom={1}
    />
  );
}

/**
 * Row header component
 */
function RowHeader({ children }: { children: string }): React.ReactElement {
  return <Text bold color="cyan">◼ {children}</Text>;
}

/**
 * Demo card component wrapper
 */
interface DemoCardProps {
  feature: string;
  description: string;
  children: React.ReactNode;
  width?: number;
}

function DemoCard({ feature, description, children, width = 45 }: DemoCardProps): React.ReactElement {
  return (
    <Box flexDirection="column" width={width} marginRight={2}>
      <Text bold color="yellow">{feature}</Text>
      <Text dimColor>{description}</Text>
      {children}
    </Box>
  );
}

/**
 * Static demo - all chart examples in a flex grid layout
 */
function StaticDemo(): React.ReactElement {
  const rpsData = generateRpsData();
  const categoryData = generateCategoryData();
  const thresholdData = generateThresholdData();

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">▄▄ ▄▄  ▄▄ ▄▄ ▄▄      ▄▄▄ ▄▄ ▄▄  ▄▄▄  ▄▄▄▄ ▄▄▄▄</Text>
      <Text bold color="cyan">██ ███▄██ ██▄█▀ ▄▄▄ ██▀▀ ██▄██ ██▀██ ██▄█▄ ██</Text>
      <Text bold color="cyan">██ ██ ▀██ ██ ██     ▀███ ██ ██ ██▀██ ██ ██ ██</Text>
      <Newline />

      {/* Row 1: BarChart examples */}
      <RowHeader>BarChart</RowHeader>
      <Box flexDirection="row" flexWrap="wrap" marginLeft={2}>
        <DemoCard feature="Sort & Format" description="Sorted descending with values">
          <BarChart
            data={categoryData}
            sort="desc"
            showValue="right"
            width={40}
            format={(value) => `${value}`}
          />
        </DemoCard>

        <DemoCard feature="Multi-Color" description="Per-bar color customization">
          <BarChart
            data={[
              { label: 'Success', value: 22, color: '#4aaa1a' },
              { label: 'Warnings', value: 8, color: '#d89612' },
              { label: 'Errors', value: 15, color: '#a61d24' }
            ]}
            sort="none"
            showValue="right"
            width={40}
          />
        </DemoCard>

        <DemoCard feature="Character Styles" description="Custom bar characters">
          <BarChart
            data={[
              { label: 'API', value: 85, char: '▆' },
              { label: 'DB', value: 65, char: '▓' },
              { label: 'Cache', value: 92, char: '▒' }
            ]}
            sort="none"
            showValue="right"
            width={35}
            max={100}
          />
        </DemoCard>
      </Box>
      <Divider />

      {/* Row 2: StackedBarChart examples */}
      <RowHeader>StackedBarChart</RowHeader>
      <Box flexDirection="row" flexWrap="wrap" marginLeft={2}>
        <DemoCard feature="Percentage Mode" description="100% stacked bar">
          <StackedBarChart
            data={[
              { label: 'Sales', value: 30, color: '#4aaa1a' },
              { label: 'Warning', value: 20, color: '#d89612' },
              { label: 'Error', value: 50, color: '#a61d24' }
            ]}
            width={40}
          />
        </DemoCard>

        <DemoCard feature="Custom Format" description="Custom value formatter">
          <StackedBarChart
            data={[
              { label: 'Development', value: 45, color: '#1890ff' },
              { label: 'Testing', value: 25, color: '#52c41a' },
              { label: 'Planning', value: 15, color: '#faad14' },
              { label: 'Meetings', value: 15, color: '#f5222d' }
            ]}
            width={40}
            format={(v) => `${v.toFixed(0)}%`}
          />
        </DemoCard>

        <DemoCard feature="Absolute Mode" description="Absolute values (max 100)">
          <StackedBarChart
            data={[
              { label: 'CPU', value: 45, color: '#1890ff' },
              { label: 'Memory', value: 30, color: '#52c41a' },
              { label: 'Disk', value: 15, color: '#faad14' }
            ]}
            mode="absolute"
            max={100}
            width={40}
            format={(v, mode) => mode === 'percentage' ? `${v.toFixed(1)}%` : `${v.toFixed(0)}`}
          />
        </DemoCard>
      </Box>
      <Divider />

      {/* Row 3: LineGraph examples */}
      <RowHeader>LineGraph</RowHeader>
      <Box flexDirection="row" flexWrap="wrap" marginLeft={2}>
        <DemoCard feature="X-Labels & Caption" description="High-res 5 levels/row">
          <LineGraph
            data={[{ values: [15, 18, 22, 25, 28, 32, 35, 33, 30, 26, 22, 18], color: 'cyan' }]}
            width={40}
            height={6}
            xLabels={['Jan', 'Dec']}
            caption="Monthly temperature (C)"
          />
        </DemoCard>

        <DemoCard feature="Multi-Series" description="Multiple data series overlay">
          <LineGraph
            data={[
              { values: [100, 105, 110, 120, 120, 110, 115, 110, 105, 100], color: 'red' },
              { values: [120, 115, 110, 110, 115, 130, 135, 140, 145, 150], color: 'cyan' },
            ]}
            width={40}
            height={6}
            yLabels={[100, 140, 160]}
            xLabels={['Q1', 'Q2', 'Q3', 'Q4']}
            caption="Red: 2023, Cyan: 2024"
          />
        </DemoCard>
      </Box>
      <Divider />

      {/* Row 4: Sparkline examples */}
      <RowHeader>Sparkline</RowHeader>
      <Box flexDirection="row" flexWrap="wrap" marginLeft={2}>
        <DemoCard feature="Block Mode" description="Block character rendering">
          <Sparkline
            data={rpsData}
            width={40}
            mode="block"
            caption="Requests per second"
          />
          <Text dimColor>Peak: {Math.max(...rpsData)} | Avg: {Math.round(rpsData.reduce((a,b) => a+b) / rpsData.length)}</Text>
        </DemoCard>

        <DemoCard feature="Gradient Color Schemes" description="8-level threshold gradients" width={55}>
          <Box flexDirection="column">
            <Box><Text>Red:   </Text><Sparkline data={thresholdData} width={40} threshold={[55, 62, 68, 74, 79, 84, 89, 94]} colorScheme="red" mode="block" /></Box>
            <Box><Text>Blue:  </Text><Sparkline data={thresholdData} width={40} threshold={[55, 62, 68, 74, 79, 84, 89, 94]} colorScheme="blue" mode="block" /></Box>
            <Box><Text>Green: </Text><Sparkline data={thresholdData} width={40} threshold={[55, 62, 68, 74, 79, 84, 89, 94]} colorScheme="green" mode="block" /></Box>
          </Box>
        </DemoCard>
      </Box>
    </Box>
  );
}

/**
 * Dynamic LineGraph demo with simulated stock prices
 */
function DynamicLineGraphDemo() {
  const [stockA, setStockA] = useState<number[]>([100, 102, 98, 105, 103, 108, 106, 110, 107, 112, 109, 115, 112, 118, 115, 120]);
  const [stockB, setStockB] = useState<number[]>([95, 97, 100, 96, 99, 102, 98, 105, 101, 108, 104, 110, 107, 112, 109, 114]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStockA(prev => {
        const lastValue = prev[prev.length - 1] ?? 100;
        const change = (Math.random() - 0.5) * 6;
        const newValue = Math.max(80, Math.min(140, lastValue + change));
        return [...prev.slice(1), newValue];
      });
      setStockB(prev => {
        const lastValue = prev[prev.length - 1] ?? 95;
        const change = (Math.random() - 0.5) * 5;
        const newValue = Math.max(75, Math.min(135, lastValue + change));
        return [...prev.slice(1), newValue];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      <Text dimColor>Red: Stock A, Blue: Stock B</Text>
      <LineGraph
        data={[
          { values: stockA, color: 'red' },
          { values: stockB, color: 'blue' },
        ]}
        width={50}
        height={6}
        yDomain={[70, 145]}
        showYAxis={true}
      />
      <Text dimColor>A: ${stockA[stockA.length - 1]?.toFixed(1)} | B: ${stockB[stockB.length - 1]?.toFixed(1)}</Text>
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

      {/* Dynamic LineGraph */}
      <Text bold color="yellow">📉 Live Stock Prices</Text>
      <Box flexDirection="column" marginLeft={2}>
        <DynamicLineGraphDemo />
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

// Force terminal columns from environment variable (for CI screenshot generation)
if (process.env.COLUMNS) {
  Object.defineProperty(process.stdout, 'columns', {
    value: parseInt(process.env.COLUMNS, 10),
    writable: true
  });
}

// Auto-run when executed directly
main();
