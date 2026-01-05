#!/usr/bin/env node
/**
 * Generate demo screenshot from ANSI output
 */
import { spawn } from 'child_process';
import AnsiToImage from 'ansi-to-image';

// Capture demo output
const demo = spawn('node', ['build/bin/demo.js'], {
  env: { ...process.env, FORCE_COLOR: '1' }
});

let output = '';
demo.stdout.on('data', (data) => {
  output += data.toString();
});

demo.stderr.on('data', (data) => {
  console.error(data.toString());
});

demo.on('close', async (code) => {
  if (code !== 0) {
    console.error(`Demo exited with code ${code}`);
    process.exit(1);
  }

  try {
    await AnsiToImage(output, {
      filename: 'assets/demo-preview.png',
      scale: 2,
      fontFamily: 'JetBrains Mono, monospace'
    });
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
