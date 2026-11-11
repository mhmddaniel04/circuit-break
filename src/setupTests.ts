import '@testing-library/jest-dom/vitest';

// jsdom has no scrolling, and the lesson page scrolls to the top on every step.
// Server tests run without a browser (no `window`), so only add this in browser tests.
if (typeof window !== 'undefined') {
  window.scrollTo = (() => {}) as typeof window.scrollTo;
}
