/**
 * Remove ANSI escape codes from a string
 */
export function stripAnsi(input: string): string {
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\u001b\[[0-9;]*[a-zA-Z]/g;
  return input.replace(ansiRegex, '');
}