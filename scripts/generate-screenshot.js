#!/usr/bin/env node
/**
 * Generate demo screenshot from ANSI output
 */
import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import ansiToSVG from 'ansi-to-svg';
import sharp from 'sharp';

// Ensure assets directory exists
mkdirSync('assets', { recursive: true });

// Capture demo output with wider terminal
const demo = spawn('node', ['build/bin/demo.js'], {
  env: { ...process.env, FORCE_COLOR: '1', COLUMNS: '120' }
});

let output = '';
demo.stdout.on('data', (data) => {
  output += data.toString();
});

demo.stderr.on('data', (data) => {
  console.error(data.toString());
});

demo.on('close', async (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Demo exited with code ${code}`);
    process.exit(1);
  }

  try {
    const svg = ansiToSVG(output, {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20
    });

    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .png()
      .toFile('assets/demo-preview.png');

    console.log('Screenshot saved to assets/demo-preview.png');
  } catch (err) {
    console.error('Failed to generate image:', err);
    process.exit(1);
  }
});

// Give demo time to render, then kill it
setTimeout(() => {
  demo.kill('SIGTERM');
}, 2000);
