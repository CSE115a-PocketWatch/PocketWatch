import { expect, it } from 'vitest';

// Fails on purpose. src/testing/test-setup.test.ts runs this to check that
// a failing test makes the test command exit non-zero.
it('always fails', () => {
  expect(1).toBe(2);
});
