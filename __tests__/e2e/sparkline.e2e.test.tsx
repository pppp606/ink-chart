/**
 * E2E Tests for Sparkline Component
 *
 * These tests use ink-testing-library to capture actual terminal output
 * and verify the rendered characters, ANSI color codes, and layout.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertContains, assertMatch } from '../helpers/assertions.js';
import React from 'react';
import { render } from 'ink-testing-library';
import { Sparkline } from '../../src/components/Sparkline.js';
import { hasAnsi, stripAnsi } from '../../src/core/ansi.js';

describe('E2E: Sparkline', () => {
  describe('Block mode output', () => {
    it('renders ascending data as block characters', () => {
      const { lastFrame } = render(
        <Sparkline data={[1, 2, 3, 4, 5, 6, 7, 8]} width={8} mode="block" />
      );
      const output = lastFrame();

      assert.equal(output, '▁▂▃▄▅▆▇█');
    });

    it('renders constant data as same height blocks', () => {
      const { lastFrame } = render(
        <Sparkline data={[5, 5, 5, 5]} width={4} mode="block" />
      );
      const output = lastFrame();

      // All same values should render as same height blocks
      assertMatch(output, /^[▁▂▃▄▅▆▇█]{4}$/);
      // All characters should be identical
      assert.equal(new Set(output?.split('')).size, 1);
    });

    it('renders descending data correctly', () => {
      const { lastFrame } = render(
        <Sparkline data={[8, 6, 4, 2]} width={4} mode="block" />
      );
      const output = lastFrame();

      assert.equal(output, '█▅▃▁');
    });

    it('handles single data point', () => {
      const { lastFrame } = render(
        <Sparkline data={[42]} width={1} mode="block" />
      );
      const output = lastFrame();

      // Single data point should render as a block character
      assertMatch(output, /^[▁▂▃▄▅▆▇█]$/);
    });
  });

  describe('Braille mode output', () => {
    it('renders data using braille characters', () => {
      const { lastFrame } = render(
        <Sparkline data={[1, 4, 8]} width={3} mode="braille" />
      );
      const output = lastFrame();

      // Should contain braille characters
      assertMatch(output, /[⠀⠄⠆⠇⠏⠟⠿⣿]/);
    });

    it('renders ascending data in braille', () => {
      const { lastFrame } = render(
        <Sparkline data={[1, 2, 3, 4, 5, 6, 7, 8]} width={8} mode="braille" />
      );
      const output = lastFrame();

      assert.equal(output, '⠀⠄⠆⠇⠏⠟⠿⣿');
    });
  });

  describe('Threshold coloring', () => {
    it('applies ANSI color when single threshold is exceeded', () => {
      const { lastFrame } = render(
        <Sparkline
          data={[10, 50, 90]}
          width={3}
          threshold={50}
          colorScheme="red"
        />
      );
      const output = lastFrame();

      assert.equal(hasAnsi(output || ''), true);
      assert.equal(stripAnsi(output || ''), '▁▄█');
    });

    it('applies gradient colors with multiple thresholds', () => {
      const { lastFrame } = render(
        <Sparkline
          data={[10, 30, 50, 70, 90]}
          width={5}
          threshold={[20, 40, 60, 80]}
          colorScheme="red"
        />
      );
      const output = lastFrame();

      assert.equal(hasAnsi(output || ''), true);
    });

    it('supports blue color scheme', () => {
      const { lastFrame } = render(
        <Sparkline
          data={[10, 90]}
          width={2}
          threshold={50}
          colorScheme="blue"
        />
      );
      const output = lastFrame();

      assert.equal(hasAnsi(output || ''), true);
    });

    it('supports green color scheme', () => {
      const { lastFrame } = render(
        <Sparkline
          data={[10, 90]}
          width={2}
          threshold={50}
          colorScheme="green"
        />
      );
      const output = lastFrame();

      assert.equal(hasAnsi(output || ''), true);
    });

    it('does not apply color when below threshold', () => {
      const { lastFrame } = render(
        <Sparkline
          data={[10, 20, 30]}
          width={3}
          threshold={50}
          colorScheme="red"
        />
      );
      const output = lastFrame();

      assert.equal(hasAnsi(output || ''), false);
    });
  });

  describe('Width handling', () => {
    it('respects explicit width setting', () => {
      const { lastFrame } = render(
        <Sparkline data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} width={5} />
      );
      const output = lastFrame();

      assert.equal(stripAnsi(output || '').length, 5);
    });

    it('handles data longer than width by resampling', () => {
      const { lastFrame } = render(
        <Sparkline data={[1, 2, 3, 4, 5, 6, 7, 8]} width={4} />
      );
      const output = lastFrame();

      assert.equal(stripAnsi(output || '').length, 4);
    });
  });

  describe('Caption', () => {
    it('renders caption when provided', () => {
      const { lastFrame } = render(
        <Sparkline data={[1, 2, 3]} width={3} caption="Test Caption" />
      );
      const output = lastFrame();

      assertContains(output, 'Test Caption');
    });
  });

  describe('yDomain', () => {
    it('uses fixed domain when specified', () => {
      const { lastFrame } = render(
        <Sparkline data={[25, 50, 75]} width={3} yDomain={[0, 100]} />
      );
      const output = lastFrame();

      // With fixed domain 0-100, values 25, 50, 75 should map to specific blocks
      assert.notEqual(output, undefined);
      assert.equal(stripAnsi(output || '').length, 3);
    });
  });
});
