import { EventEmitter } from 'events';

/**
 * Mock stdout for testing terminal width changes
 */
export class FakeStdout extends EventEmitter {
  public columns: number;
  public rows: number;

  constructor(columns = 80, rows = 24) {
    super();
    this.columns = columns;
    this.rows = rows;
  }

  /**
   * Simulate terminal resize
   */
  resize(columns: number, rows = this.rows) {
    this.columns = columns;
    this.rows = rows;
    this.emit('resize');
  }

  /**
   * Get current terminal size
   */
  getWindowSize(): [number, number] {
    return [this.columns, this.rows];
  }

  // Mock other stdout properties that ink might use
  get isTTY() {
    return true;
  }

  write() {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  end() {}
}