import '@testing-library/jest-dom/vitest';

// jsdom has no scrolling. The lesson page scrolls to the top on every step.
window.scrollTo = (() => {}) as typeof window.scrollTo;
