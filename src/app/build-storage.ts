import type { BuildSnapshot } from '../build/build-snapshot';

export type BuildStorage = {
  // The build code in the address bar, or an empty string.
  readonly sharedCode: () => string;
  readonly savedSnapshot: () => unknown;
  readonly save: (snapshot: BuildSnapshot, code: string) => void;
};

// Saving is a convenience: storage throws in private windows or when site data is blocked,
// and a malformed address or a refused history change must not stop the planner either.
export function createBrowserBuildStorage(browser: Window, key: string): BuildStorage {
  return {
    sharedCode: () => {
      try {
        return decodeURIComponent(browser.location.hash.slice(1));
      } catch {
        return '';
      }
    },
    savedSnapshot: () => {
      try {
        const saved: unknown = JSON.parse(browser.localStorage.getItem(key) ?? 'null');
        return saved;
      } catch {
        return null;
      }
    },
    save: (snapshot, code) => {
      try {
        browser.localStorage.setItem(key, JSON.stringify(snapshot));
      } catch {
        // Best effort, see above.
      }
      try {
        browser.history.replaceState(null, '', `#${code}`);
      } catch {
        // Best effort, see above.
      }
    },
  };
}
