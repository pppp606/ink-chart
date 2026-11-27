import React from 'react';
import { render } from 'ink-testing-library';

/** Terminal columns that make useAutoWidth report a width of 80. */
const TEST_COLUMNS = 82;

class ErrorCatcher extends React.Component<
  { onError: (error: unknown) => void; children: React.ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Renders a component through Ink and returns the frame it produced.
 *
 * Returns null when the component rendered nothing, and rethrows any error the
 * component threw, so tests can treat it like calling the component directly.
 */
export function renderToFrame<P extends object>(
  Component: React.ComponentType<P>,
  props: P
): string | null {
  const original = Object.getOwnPropertyDescriptor(process.stdout, 'columns');
  Object.defineProperty(process.stdout, 'columns', {
    value: TEST_COLUMNS,
    writable: true,
    configurable: true,
  });

  let caught: { error: unknown } | undefined;
  try {
    const { lastFrame, unmount } = render(
      <ErrorCatcher onError={(error) => (caught = { error })}>
        <Component {...props} />
      </ErrorCatcher>
    );
    const frame = lastFrame();
    unmount();
    if (caught) {
      throw caught.error;
    }
    return frame ? frame : null;
  } finally {
    if (original) {
      Object.defineProperty(process.stdout, 'columns', original);
    } else {
      delete (process.stdout as { columns?: number }).columns;
    }
  }
}
