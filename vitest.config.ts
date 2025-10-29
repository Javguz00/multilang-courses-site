import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

const projectRoot = fileURLToPath(new URL('./', import.meta.url));

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
    globals: true,
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@': projectRoot,
      '@/': projectRoot,
    },
  },
});
