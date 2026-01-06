#!/usr/bin/env node
/**
 * Generate demo screenshot from ANSI output
 */
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import ansiToSVG from 'ansi-to-svg';

// Ensure assets directory exists
mkdirSync('assets', { recursive: true });

// Capture demo output with wider terminal for flex layout
const demo = spawn('node', ['build/bin/demo.js'], {
  env: { ...process.env, FORCE_COLOR: '1', COLUMNS: '200' }
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
    const svg = ansiToSVG(output, {
      fontSize: 14,
      lineHeight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20
    });
    writeFileSync('assets/demo-preview.svg', svg);
    console.log('Screenshot saved to assets/demo-preview.svg');
  } catch (err) {
    console.error('Failed to generate image:', err);
    process.exit(1);
  }
});

// Give demo time to render, then kill it
setTimeout(() => {
  demo.kill('SIGTERM');
}, 2000);
