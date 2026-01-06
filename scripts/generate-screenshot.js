#!/usr/bin/env node
/**
 * Generate demo screenshot from ANSI output
 */
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import ansiToSVG from 'ansi-to-svg';

// Ensure assets directory exists
mkdirSync('assets', { recursive: true });

// Capture demo output with wider terminal
const demo = spawn('node', ['build/bin/demo.js'], {
  env: { ...process.env, FORCE_COLOR: '1', COLUMNS: '150' }
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
      fontSize: 16,
      lineHeight: 1.2,
      paddingTop: 30,
      paddingBottom: 30,
      paddingLeft: 30,
      paddingRight: 30
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
