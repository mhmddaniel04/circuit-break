// Public API of the hints feature (browser side).
export { HintPanel } from './components/HintPanel';
export { buildHintRequest } from './hintRequest';
export { MAX_HINTS } from './hintSchema';
export type { HintRequest } from './hintSchema';
export { useHints, type Hint } from './useHints';