export type BuildAddress = {
  // The build code of the address the page was opened with, or an empty string.
  readonly code: () => string;
  // The page address that opens a build code, or an empty build for null.
  readonly linkTo: (code: string | null) => string;
  // Puts a build code into the address bar without adding a history entry.
  readonly show: (code: string | null) => void;
};

const PARAMETER = 'build';

// The build code in a link or in pasted text: the build parameter of a link, the hash of a 1.x link,
// or the text itself when it is not a link.
export function buildCodeIn(text: string): string {
  const trimmed = text.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.searchParams.get(PARAMETER) ?? url.hash.slice(1);
  } catch {
    return '';
  }
}

// The address bar holds the build: a link opens exactly that build, a plain address an empty one.
export function createBrowserBuildAddress(browser: Window): BuildAddress {
  const linkTo = (code: string | null): string => {
    const url = new URL(browser.location.href);
    url.hash = '';
    if (code === null) url.searchParams.delete(PARAMETER);
    else url.searchParams.set(PARAMETER, code);
    return url.href;
  };

  return {
    code: () => buildCodeIn(browser.location.href),
    linkTo,
    show: (code) => {
      try {
        browser.history.replaceState(null, '', linkTo(code));
      } catch {
        // Safari refuses more than 100 history changes in 30 seconds, which must not stop the planner.
      }
    },
  };
}
