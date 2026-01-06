#!/usr/bin/env node
/**
 * Generate demo screenshot from ANSI output
 * Handles truecolor (24-bit) ANSI sequences by post-processing the SVG
 */
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import ansiToSVG from 'ansi-to-svg';

// Ensure assets directory exists
mkdirSync('assets', { recursive: true });

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Pre-process ANSI output to convert truecolor sequences to basic colors
 * Each unique truecolor gets mapped to a rotating basic color
 */
function preprocessAnsi(ansi) {
  // Track unique colors and their assigned basic colors
  const colorAssignments = new Map(); // hexColor -> basicColorIndex
  let nextColorIndex = 0;

  // Basic ANSI color codes that ansi-to-svg supports
  const basicColors = [
    '\x1b[31m', // red
    '\x1b[32m', // green
    '\x1b[33m', // yellow
    '\x1b[34m', // blue
    '\x1b[35m', // magenta
    '\x1b[36m', // cyan
    '\x1b[91m', // bright red
    '\x1b[92m', // bright green
    '\x1b[93m', // bright yellow
    '\x1b[94m', // bright blue
    '\x1b[95m', // bright magenta
    '\x1b[96m', // bright cyan
  ];

  // ansi-to-svg hex colors for these ANSI codes
  const basicToHex = [
    '#B22222', // red -> firebrick
    '#228B22', // green -> forestgreen
    '#DAA520', // yellow -> goldenrod
    '#4169E1', // blue -> royalblue
    '#8B008B', // magenta -> darkmagenta
    '#008B8B', // cyan -> darkcyan
    '#FF4500', // bright red -> orangered
    '#32CD32', // bright green -> limegreen
    '#FFD700', // bright yellow -> gold
    '#87CEEB', // bright blue -> skyblue
    '#9932CC', // bright magenta -> darkorchid
    '#00CED1', // bright cyan -> darkturquoise
  ];

  // Map to store original color -> replacement info
  const replacements = new Map(); // originalHex -> { basicIndex, svgHex }

  // Match truecolor foreground: \x1b[38;2;R;G;Bm
  const truecolorRegex = /\x1b\[38;2;(\d+);(\d+);(\d+)m/g;

  const processedOutput = ansi.replace(truecolorRegex, (match, r, g, b) => {
    const hexColor = rgbToHex(parseInt(r), parseInt(g), parseInt(b));

    if (!colorAssignments.has(hexColor)) {
      const basicIndex = nextColorIndex % basicColors.length;
      colorAssignments.set(hexColor, basicIndex);
      replacements.set(hexColor, {
        basicIndex,
        svgHex: basicToHex[basicIndex]
      });
      nextColorIndex++;
    }

    const basicIndex = colorAssignments.get(hexColor);
    return basicColors[basicIndex];
  });

  return { processedOutput, replacements };
}

/**
 * Post-process SVG to replace basic ANSI colors with actual RGB hex colors
 */
function postprocessSvg(svg, replacements) {
  let result = svg;

  // Group colors by their SVG hex value
  const svgHexToOriginal = new Map();
  for (const [originalHex, { svgHex }] of replacements) {
    if (!svgHexToOriginal.has(svgHex)) {
      svgHexToOriginal.set(svgHex, []);
    }
    svgHexToOriginal.get(svgHex).push(originalHex);
  }

  // Replace each SVG hex with the first original color that maps to it
  // This is imperfect but handles the common case
  for (const [svgHex, originalColors] of svgHexToOriginal) {
    if (originalColors.length === 1) {
      // Simple case: one-to-one mapping
      result = result.replace(
        new RegExp(`fill="${svgHex}"`, 'gi'),
        `fill="${originalColors[0]}"`
      );
    } else {
      // Multiple colors mapped to same basic color - use the most vibrant
      // Sort by saturation/brightness to pick the "main" color
      const mainColor = originalColors.sort((a, b) => {
        // Simple heuristic: prefer colors with larger RGB differences
        const parseHex = (h) => [
          parseInt(h.slice(1, 3), 16),
          parseInt(h.slice(3, 5), 16),
          parseInt(h.slice(5, 7), 16)
        ];
        const [r1, g1, b1] = parseHex(a);
        const [r2, g2, b2] = parseHex(b);
        const sat1 = Math.max(r1, g1, b1) - Math.min(r1, g1, b1);
        const sat2 = Math.max(r2, g2, b2) - Math.min(r2, g2, b2);
        return sat2 - sat1;
      })[0];

      result = result.replace(
        new RegExp(`fill="${svgHex}"`, 'gi'),
        `fill="${mainColor}"`
      );
    }
  }

  return result;
}

// Capture demo output with wider terminal for flex layout
const demo = spawn('node', ['build/bin/demo.js'], {
  env: { ...process.env, FORCE_COLOR: '3', COLUMNS: '150' }
});

let output = '';
demo.stdout.on('data', (data) => {
  output += data.toString();
});

demo.stderr.on('data', (data) => {
  console.error(data.toString());
});

demo.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Demo exited with code ${code}`);
    process.exit(1);
  }

  try {
    // Pre-process to handle truecolor
    const { processedOutput, replacements } = preprocessAnsi(output);

    // Generate SVG
    let svg = ansiToSVG(processedOutput, {
      fontSize: 14,
      lineHeight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20
    });

    // Post-process to fix colors
    svg = postprocessSvg(svg, replacements);

    writeFileSync('assets/demo-preview.svg', svg);
    console.log('Screenshot saved to assets/demo-preview.svg');
    console.log(`Processed ${replacements.size} unique truecolor values`);
  } catch (err) {
    console.error('Failed to generate image:', err);
    process.exit(1);
  }
});

// Give demo time to render, then kill it
setTimeout(() => {
  demo.kill('SIGTERM');
}, 2000);
