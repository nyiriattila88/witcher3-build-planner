// What is deployed: the version from package.json, the commit and the build date, injected by vite.config.ts.
export const RELEASE = {
  version: __APP_VERSION__,
  commit: __APP_COMMIT__,
  builtAt: __APP_BUILT_AT__,
} as const;
