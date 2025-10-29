// Vitest setup file
import { afterEach, beforeEach } from 'vitest';

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  // Reset any env tweaks between tests
  process.env = { ...originalEnv };
});
