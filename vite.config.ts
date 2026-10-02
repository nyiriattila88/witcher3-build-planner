import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import packageJson from './package.json' with { type: 'json' };

// The footer shows which commit is live. CI provides it, a local build asks git.
function currentCommit(): string {
  const fromCi = process.env.GITHUB_SHA;
  if (fromCi !== undefined) return fromCi.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

export default defineConfig({
  // GitHub Pages serves a project site under the repository name.
  base: '/witcher3-build-planner/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_COMMIT__: JSON.stringify(currentCommit()),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
