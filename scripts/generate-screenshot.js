#!/usr/bin/env node
/**
 * Generate demo screenshot from ANSI output
 * Custom SVG renderer with full truecolor support
 */
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';

// Ensure assets directory exists
mkdirSync('assets', { recursive: true });

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Basic ANSI color palette (0-15)
 */
const ANSI_COLORS = [
  '#000000', // 0 black
  '#B22222', // 1 red
  '#228B22', // 2 green
  '#DAA520', // 3 yellow
  '#4169E1', // 4 blue
  '#8B008B', // 5 magenta
  '#008B8B', // 6 cyan
  '#D3D3D3', // 7 white
  '#808080', // 8 bright black (gray)
  '#FF6347', // 9 bright red
  '#32CD32', // 10 bright green
  '#FFD700', // 11 bright yellow
  '#87CEEB', // 12 bright blue
  '#DA70D6', // 13 bright magenta
  '#00CED1', // 14 bright cyan
  '#FFFFFF', // 15 bright white
];

/**
 * Parse ANSI escape sequences and extract styled text segments
 */
function parseAnsi(ansi) {
  const segments = [];
  let currentStyle = {
    foreground: null,
    background: null,
    bold: false,
    dim: false,
  };

  // ANSI escape sequence regex
  const ansiRegex = /\x1b\[([0-9;]*)m/g;

  let lastIndex = 0;
  let match;

  while ((match = ansiRegex.exec(ansi)) !== null) {
    // Add text before this escape sequence
    if (match.index > lastIndex) {
      const text = ansi.slice(lastIndex, match.index);
      if (text) {
        segments.push({ text, style: { ...currentStyle } });
      }
    }

    // Parse the escape sequence
    const codes = match[1].split(';').map(Number);
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];

      if (code === 0) {
        // Reset
        currentStyle = { foreground: null, background: null, bold: false, dim: false };
      } else if (code === 1) {
        currentStyle.bold = true;
      } else if (code === 2) {
        currentStyle.dim = true;
      } else if (code === 22) {
        currentStyle.bold = false;
        currentStyle.dim = false;
      } else if (code === 39) {
        currentStyle.foreground = null;
      } else if (code === 49) {
        currentStyle.background = null;
      } else if (code >= 30 && code <= 37) {
        // Standard foreground colors
        currentStyle.foreground = ANSI_COLORS[code - 30];
      } else if (code >= 40 && code <= 47) {
        // Standard background colors
        currentStyle.background = ANSI_COLORS[code - 40];
      } else if (code >= 90 && code <= 97) {
        // Bright foreground colors
        currentStyle.foreground = ANSI_COLORS[code - 90 + 8];
      } else if (code >= 100 && code <= 107) {
        // Bright background colors
        currentStyle.background = ANSI_COLORS[code - 100 + 8];
      } else if (code === 38) {
        // Extended foreground color
        if (codes[i + 1] === 2) {
          // Truecolor: 38;2;R;G;B
          const r = codes[i + 2];
          const g = codes[i + 3];
          const b = codes[i + 4];
          currentStyle.foreground = rgbToHex(r, g, b);
          i += 4;
        } else if (codes[i + 1] === 5) {
          // 256 color: 38;5;N
          i += 2;
        }
      } else if (code === 48) {
        // Extended background color
        if (codes[i + 1] === 2) {
          // Truecolor: 48;2;R;G;B
          const r = codes[i + 2];
          const g = codes[i + 3];
          const b = codes[i + 4];
          currentStyle.background = rgbToHex(r, g, b);
          i += 4;
        } else if (codes[i + 1] === 5) {
          // 256 color: 48;5;N
          i += 2;
        }
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < ansi.length) {
    const text = ansi.slice(lastIndex);
    if (text) {
      segments.push({ text, style: { ...currentStyle } });
    }
  }

  return segments;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Check if two styles are equal
 */
function styleEquals(a, b) {
  return a.foreground === b.foreground &&
         a.background === b.background &&
         a.bold === b.bold &&
         a.dim === b.dim;
}

/**
 * Generate SVG from parsed ANSI segments
 * Optimized: groups consecutive characters with same style
 */
function generateSvg(segments, options = {}) {
  const {
    fontSize = 14,
    lineHeight = 20,
    charWidth = 8.4,
    paddingTop = 20,
    paddingBottom = 20,
    paddingLeft = 20,
    paddingRight = 20,
    fontFamily = 'SauceCodePro Nerd Font, Source Code Pro, Courier, monospace',
    backgroundColor = '#000000',
    defaultColor = '#D3D3D3',
  } = options;

  // Split into lines and calculate dimensions
  let allText = '';
  for (const seg of segments) {
    allText += seg.text;
  }
  const lines = allText.split('\n');
  const maxLineLength = Math.max(...lines.map(l => l.length));

  const width = paddingLeft + (maxLineLength * charWidth) + paddingRight;
  const height = paddingTop + (lines.length * lineHeight) + paddingBottom;

  // Build text runs (grouped by style and line)
  const textRuns = [];
  let currentRun = null;
  let x = paddingLeft;
  let y = paddingTop + fontSize;
  let lineNum = 0;

  for (const segment of segments) {
    const { text, style } = segment;

    for (const char of text) {
      if (char === '\n') {
        // Flush current run
        if (currentRun && currentRun.text) {
          textRuns.push(currentRun);
        }
        currentRun = null;
        lineNum++;
        x = paddingLeft;
        y = paddingTop + fontSize + (lineNum * lineHeight);
        continue;
      }

      const isSpace = char === ' ';

      // If we have a background, we need to track spaces too
      if (!isSpace || style.background) {
        if (currentRun && styleEquals(currentRun.style, style) && currentRun.y === y) {
          // Continue current run
          currentRun.text += char;
          currentRun.width += charWidth;
        } else {
          // Flush previous run and start new one
          if (currentRun && currentRun.text) {
            textRuns.push(currentRun);
          }
          currentRun = {
            text: char,
            style: { ...style },
            x,
            y,
            width: charWidth,
          };
        }
      } else {
        // Space with no background - flush current run
        if (currentRun && currentRun.text) {
          textRuns.push(currentRun);
          currentRun = null;
        }
      }

      x += charWidth;
    }
  }

  // Flush final run
  if (currentRun && currentRun.text) {
    textRuns.push(currentRun);
  }

  // Build SVG content
  let svgContent = '';

  // Background
  svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"/>`;

  // Draw text runs
  for (const run of textRuns) {
    // Draw background if set
    if (run.style.background) {
      svgContent += `<rect x="${run.x.toFixed(2)}" y="${(run.y - fontSize + 2).toFixed(2)}" width="${run.width.toFixed(2)}" height="${lineHeight}" fill="${run.style.background}"/>`;
    }

    // Draw text (skip if only spaces)
    const trimmedText = run.text.replace(/ +$/, ''); // Trim trailing spaces
    if (trimmedText) {
      const color = run.style.foreground || defaultColor;
      let attrs = `x="${run.x.toFixed(2)}" y="${run.y.toFixed(2)}" fill="${color}"`;
      if (run.style.bold) {
        attrs += ' font-weight="bold"';
      }
      if (run.style.dim) {
        attrs += ' opacity="0.5"';
      }
      svgContent += `<text ${attrs}>${escapeXml(run.text)}</text>`;
    }
  }

  // Wrap in SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}" font-family="${fontFamily}" font-size="${fontSize}">${svgContent}</svg>`;

  return svg;
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
    // Parse ANSI and generate SVG directly
    const segments = parseAnsi(output);
    const svg = generateSvg(segments);

    writeFileSync('assets/demo-preview.svg', svg);
    console.log('Screenshot saved to assets/demo-preview.svg');

    // Count unique colors used
    const colors = new Set();
    for (const seg of segments) {
      if (seg.style.foreground) colors.add(seg.style.foreground);
    }
    console.log(`Used ${colors.size} unique foreground colors`);
  } catch (err) {
    console.error('Failed to generate image:', err);
    process.exit(1);
  }
});

// Give demo time to render, then kill it
setTimeout(() => {
  demo.kill('SIGTERM');
}, 2000);
