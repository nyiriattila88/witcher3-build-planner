import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom lays nothing out, so it has neither of the two layout APIs the components call.
globalThis.ResizeObserver = class {
  observe = (): void => undefined;
  unobserve = (): void => undefined;
  disconnect = (): void => undefined;
};
Element.prototype.scrollIntoView = (): void => undefined;

// Testing Library unmounts by itself only when the test functions are globals, which they are not here.
afterEach(() => {
  cleanup();
});
