#!/usr/bin/env node
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo CLI application for ink-chart components
 *
 * This demo showcases both Sparkline and BarChart components with realistic
 * data examples that demonstrate key features like auto-scaling, sorting,
 * threshold highlighting, and value positioning.
 */
import { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import { exec } from 'child_process';
import { Sparkline, BarChart, StackedBarChart } from '../src/index.js';
/**
 * Generate realistic RPS (Requests Per Second) data
 * Simulates server performance metrics over time
 */
function generateRpsData() {
    // Realistic RPS data showing daily server load pattern
    // Values represent requests per second throughout a day
    return [45, 52, 48, 67, 71, 58, 63, 89, 94, 82, 76, 69, 55, 51,
        48, 44, 39, 42, 38, 35, 41, 47, 52, 58];
}
/**
 * Generate realistic business category data
 * Represents different department performance metrics
 */
function generateCategoryData() {
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
function generateThresholdData() {
    // Values that cross 8-level thresholds for smooth gradient demonstration
    return [45, 55, 60, 65, 70, 75, 80, 85, 90, 95, 88, 82, 77, 72, 68, 62, 58, 52];
}
/**
 * Dynamic sparkline demo with simulated data
 */
function DynamicSparklineDemo() {
    const [rpsHistory, setRpsHistory] = useState([45, 52, 48, 67, 71, 58, 63, 89, 94, 82, 76, 69, 55, 51, 48, 44, 39, 42, 38, 35, 41, 47, 52, 58]);
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
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Live RPS Trend (rolling window):" }), _jsx(Sparkline, { data: rpsHistory, width: 50, mode: "block", threshold: [60, 70, 80, 90], colorScheme: "blue" }), _jsxs(Text, { dimColor: true, children: ["Current: ", rpsHistory[rpsHistory.length - 1]?.toFixed(0), " RPS | Peak: ", Math.max(...rpsHistory).toFixed(0), " RPS"] }), _jsx(Text, { children: " " })] }));
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
                value: Math.max(0.1, Math.min(35, process.value + (Math.random() - 0.5) * 3))
            })));
        }, 3000); // 3 second intervals
        return () => clearInterval(interval);
    }, []);
    return (_jsxs(Box, { flexDirection: "column", height: 8, children: [_jsxs(Text, { children: ["Memory: ", memoryUsage.toFixed(1), "%"] }), _jsx(BarChart, { data: [{ label: 'RAM Used', value: memoryUsage, color: '#d89612' }], width: 50, max: 100, showValue: "right", format: (value) => `${value.toFixed(1)}%` }), _jsx(Text, { children: " " }), _jsx(Text, { children: "CPU by Process:" }), _jsx(Box, { height: 4, children: _jsx(BarChart, { data: cpuData, width: 50, showValue: "right", format: (value) => `${value.toFixed(1)}%` }) })] }));
}
/**
 * Static demo - all chart examples without updates
 */
function StaticDemo() {
    const rpsData = generateRpsData();
    const categoryData = generateCategoryData();
    const thresholdData = generateThresholdData();
    const [coverageData, setCoverageData] = useState([]);
    useEffect(() => {
        exec('npm run test:coverage -- --silent 2>/dev/null', (error, stdout, _stderr) => {
            if (error) {
                setCoverageData([
                    { label: 'Coverage data unavailable', value: 0, color: '#666666' }
                ]);
                return;
            }
            const lines = stdout.split('\n');
            const data = [];
            for (const line of lines) {
                const match = line.match(/^\s*(\S+)\s+\|\s+([0-9.]+)/);
                if (match) {
                    const [, filename, coverage] = match;
                    if (filename && coverage && filename.includes('.ts') && !filename.includes('All files')) {
                        const coverageNum = parseFloat(coverage);
                        const color = coverageNum >= 90 ? '#4CAF50' :
                            coverageNum >= 75 ? '#8BC34A' :
                                coverageNum >= 60 ? '#CDDC39' : '#FF9800';
                        const filename_part = filename.split('/').pop();
                        if (filename_part) {
                            data.push({
                                label: filename_part,
                                value: coverageNum,
                                color
                            });
                        }
                    }
                }
            }
            if (data.length > 0) {
                setCoverageData(data);
            }
        });
    }, []);
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDE80 ink-chart Demo - Static Examples" }), _jsx(Text, { dimColor: true, children: "Press 'q' + Enter to quit or Ctrl+C" }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83D\uDCC8 Sparkline Example: Server RPS Over 24 Hours" }), _jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsx(Sparkline, { data: rpsData, width: 50, mode: "block", caption: "Requests per second (24h trend)" }), _jsxs(Text, { dimColor: true, children: ["Peak: ", Math.max(...rpsData), " RPS | Average: ", Math.round(rpsData.reduce((a, b) => a + b) / rpsData.length), " RPS"] })] }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83C\uDFA8 Sparkline Gradient Color Schemes" }), _jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsx(Text, { children: "8-level gradients (55, 62, 68, 74, 79, 84, 89, 94):" }), _jsx(Text, { children: " " }), _jsx(Text, { children: "Red:   " }), _jsx(Sparkline, { data: thresholdData, width: 50, threshold: [55, 62, 68, 74, 79, 84, 89, 94], colorScheme: "red", mode: "block" }), _jsx(Text, { children: "Blue:  " }), _jsx(Sparkline, { data: thresholdData, width: 50, threshold: [55, 62, 68, 74, 79, 84, 89, 94], colorScheme: "blue", mode: "block" }), _jsx(Text, { children: "Green: " }), _jsx(Sparkline, { data: thresholdData, width: 50, threshold: [55, 62, 68, 74, 79, 84, 89, 94], colorScheme: "green", mode: "block" })] }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83D\uDCCA BarChart Example: Department Performance" }), _jsx(Box, { flexDirection: "column", marginLeft: 2, children: _jsx(BarChart, { data: categoryData, sort: "desc", showValue: "right", width: 50, format: (value) => `${value}` }) }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83C\uDFA8 BarChart Multi-Color Example" }), _jsx(Box, { flexDirection: "column", marginLeft: 2, children: _jsx(BarChart, { data: [
                        { label: 'Success', value: 22, color: '#4aaa1a' },
                        { label: 'Warnings', value: 8, color: '#d89612' },
                        { label: 'Errors', value: 15, color: '#a61d24' }
                    ], sort: "none", showValue: "right", width: 50 }) }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83D\uDCCA Test Coverage Example" }), _jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsx(Text, { dimColor: true, children: "Real project test coverage visualization" }), coverageData.length > 0 ? (_jsx(BarChart, { data: coverageData, sort: "desc", showValue: "right", format: (v) => `${v.toFixed(1)}%`, width: 60, max: 100, barChar: "\u2593" })) : (_jsx(Text, { dimColor: true, children: "Loading coverage data..." }))] }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83D\uDCCA StackedBarChart Example: Distribution" }), _jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsx(Text, { dimColor: true, children: "100% stacked bar showing percentage distribution" }), _jsx(StackedBarChart, { data: [
                            { label: 'Sales', value: 30, color: '#4aaa1a' },
                            { label: 'Warning', value: 20, color: '#d89612' },
                            { label: 'Error', value: 50, color: '#a61d24' }
                        ], width: 50 })] }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83C\uDFAF StackedBarChart: Project Time Allocation" }), _jsx(Box, { flexDirection: "column", marginLeft: 2, children: _jsx(StackedBarChart, { data: [
                        { label: 'Development', value: 45, color: '#1890ff', char: '█' },
                        { label: 'Testing', value: 25, color: '#52c41a', char: '▓' },
                        { label: 'Planning', value: 15, color: '#faad14', char: '▒' },
                        { label: 'Meetings', value: 15, color: '#f5222d', char: '░' }
                    ], width: 60, format: (v) => `${v.toFixed(0)}%` }) })] }));
}
/**
 * Dynamic demo - live updating charts
 */
function DynamicDemo() {
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "\uD83D\uDE80 ink-chart Demo - Live Charts" }), _jsx(Text, { dimColor: true, children: "Press 'q' + Enter to quit or Ctrl+C" }), _jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "yellow", children: "\uD83D\uDCC8 Live RPS Trend" }), _jsx(Box, { flexDirection: "column", marginLeft: 2, children: _jsx(DynamicSparklineDemo, {}) }), _jsx(Text, { bold: true, color: "yellow", children: "\u26A1 Live System Stats" }), _jsx(Box, { flexDirection: "column", marginLeft: 2, children: _jsx(DynamicSystemDemo, {}) })] }));
}
/**
 * Entry point functions for different demo modes
 */
export function staticDemo() {
    const { unmount } = render(_jsx(StaticDemo, {}));
    setupExitHandling(unmount);
}
export function dynamicDemo() {
    const { unmount } = render(_jsx(DynamicDemo, {}));
    setupExitHandling(unmount);
}
/**
 * Setup exit handling for both demos
 */
function setupExitHandling(unmount) {
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
