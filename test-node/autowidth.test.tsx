import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { Text } from 'ink';
import { render } from 'ink-testing-library';
import { useAutoWidth } from '../src/core/useAutoWidth.js';

const DEBOUNCE_MS = 120;

let renderCount = 0;

/** Renders the hook's result as text so tests can read it from the frame. */
function Probe() {
  const { width, isAutoWidth } = useAutoWidth();
  renderCount++;
  return <Text>{`width=${width} auto=${isAutoWidth}`}</Text>;
}

const originalColumns = Object.getOwnPropertyDescriptor(process.stdout, 'columns');

function setColumns(value: number | undefined) {
  Object.defineProperty(process.stdout, 'columns', {
    value,
    writable: true,
    configurable: true,
  });
}

/**
 * Lets React commit a pending state update. React schedules the re-render with
 * setImmediate, which the fake timers leave alone, and needs two turns to commit.
 */
const flush = async () => {
  for (let turn = 0; turn < 2; turn++) {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
};

describe('useAutoWidth Hook', () => {
  let unmount: (() => void) | undefined;

  const mount = () => {
    const instance = render(<Probe />);
    unmount = instance.unmount;
    return instance;
  };

  beforeEach(() => {
    setColumns(80);
    renderCount = 0;
  });

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    mock.timers.reset();
    if (originalColumns) {
      Object.defineProperty(process.stdout, 'columns', originalColumns);
    } else {
      delete (process.stdout as { columns?: number }).columns;
    }
  });

  it('should be defined and exportable', () => {
    assert.equal(typeof useAutoWidth, 'function');
  });

  it('should return the terminal width minus the safety margin', () => {
    const { lastFrame } = mount();

    assert.equal(lastFrame(), 'width=78 auto=true');
  });

  it('should provide fallback width when columns is undefined', () => {
    setColumns(undefined);

    const { lastFrame } = mount();

    assert.equal(lastFrame(), 'width=78 auto=true');
  });

  it('should register and cleanup SIGWINCH event listener', async () => {
    const before = process.listenerCount('SIGWINCH');

    mount();
    await flush();
    assert.equal(process.listenerCount('SIGWINCH'), before + 1);

    unmount?.();
    unmount = undefined;
    await flush();
    assert.equal(process.listenerCount('SIGWINCH'), before);
  });

  it('should debounce rapid terminal resize events (40→80→100 = 1 redraw in 120ms)', async () => {
    setColumns(40);
    const { lastFrame } = mount();
    await flush();
    assert.equal(lastFrame(), 'width=38 auto=true');

    mock.timers.enable({ apis: ['setTimeout'] });
    const rendersBefore = renderCount;

    setColumns(80);
    process.emit('SIGWINCH');
    setColumns(100);
    process.emit('SIGWINCH');

    mock.timers.tick(100);
    await flush();
    assert.equal(renderCount, rendersBefore, 'no redraw inside the debounce window');
    assert.equal(lastFrame(), 'width=38 auto=true');

    mock.timers.tick(25);
    await flush();
    assert.equal(renderCount, rendersBefore + 1, 'exactly one redraw after the window');
    assert.equal(lastFrame(), 'width=98 auto=true');
  });

  it('should properly handle multiple debounced events', async () => {
    const { lastFrame } = mount();
    await flush();

    mock.timers.enable({ apis: ['setTimeout'] });
    const rendersBefore = renderCount;

    setColumns(100);
    process.emit('SIGWINCH');
    mock.timers.tick(50);

    setColumns(120);
    process.emit('SIGWINCH');
    mock.timers.tick(50);

    setColumns(90);
    process.emit('SIGWINCH');

    await flush();
    assert.equal(renderCount, rendersBefore, 'each event restarts the debounce window');
    assert.equal(lastFrame(), 'width=78 auto=true');

    mock.timers.tick(DEBOUNCE_MS - 1);
    await flush();
    assert.equal(renderCount, rendersBefore, 'still waiting 1ms before the window closes');

    mock.timers.tick(1);
    await flush();
    assert.equal(renderCount, rendersBefore + 1);
    assert.equal(lastFrame(), 'width=88 auto=true');
  });
});
