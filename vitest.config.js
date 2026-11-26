import { defineConfig } from 'vitest/config';

// Vitest runs the pure layers (domain / application / algorithms) in Node.
// React components and the imperative canvas visualizers are deliberately out
// of scope — the logic they render lives in the pure layers and is covered
// there. See AGENTS.md → "Architecture".
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    // No globals: every test file imports { describe, it, expect } from 'vitest'.
    globals: false,
    // The exhaustive B-Tree / red-black property tests take ~2s alone but can
    // exceed the 5s default when many workers share a slow machine. The extra
    // headroom only prevents flaky timeouts; assertions are unchanged.
    testTimeout: 20000,
  },
});
