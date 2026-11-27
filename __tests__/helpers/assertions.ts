import assert from 'node:assert/strict';

type Container = string | readonly unknown[] | null | undefined;

function includes(actual: Container, expected: unknown): boolean {
  if (typeof actual === 'string') {
    return typeof expected === 'string' && actual.includes(expected);
  }
  return Array.isArray(actual) && actual.includes(expected);
}

/** Asserts that a string contains a substring, or that an array contains an item. */
export function assertContains(actual: Container, expected: unknown): void {
  if (!includes(actual, expected)) {
    assert.fail(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
  }
}

/** Asserts that a string does not contain a substring, or an array an item. */
export function assertNotContains(actual: Container, expected: unknown): void {
  if (includes(actual, expected)) {
    assert.fail(`Expected ${JSON.stringify(actual)} not to contain ${JSON.stringify(expected)}`);
  }
}

/** assert.match that also fails cleanly when the value is not a string. */
export function assertMatch(actual: string | null | undefined, pattern: RegExp): void {
  assert.equal(typeof actual, 'string', `Expected a string to match ${pattern}`);
  assert.match(actual as string, pattern);
}

/** assert.doesNotMatch that also fails cleanly when the value is not a string. */
export function assertNotMatch(actual: string | null | undefined, pattern: RegExp): void {
  assert.equal(typeof actual, 'string', `Expected a string not to match ${pattern}`);
  assert.doesNotMatch(actual as string, pattern);
}
