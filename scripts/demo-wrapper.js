#!/usr/bin/env node
/**
 * Wrapper script that sets terminal columns before importing demo
 * This is necessary because ES modules hoist imports, so we can't
 * set process.stdout.columns before ink is imported in the main demo file.
 */

// Set terminal columns from environment variable
const columns = parseInt(process.env.COLUMNS, 10) || 80;
Object.defineProperty(process.stdout, 'columns', {
  value: columns,
  writable: true
});

// Now import and run the demo
import('../build/bin/demo.js');
