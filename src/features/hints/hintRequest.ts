import { checkSolution, findSolutions, type Placement } from '@/features/simulation';
import type { Level } from '@/levels';
import type { HintRequest } from './components/hintSchema';

/** The solution closest to what the student has built (some levels have more than one). */
function closestSolution(level: Level, placement: Placement): Placement {
  const solutions = findSolutions(level, level.toolbox);
  let best: Placement = solutions[0] ?? {};
  let bestMatches = -1;
  for (const solution of solutions) {
    const matches = Object.entries(solution).filter(([id, gate]) => placement[id] === gate).length;
    if (matches > bestMatches) {
      best = solution;
      bestMatches = matches;
    }
  }
  return best;
}

/** Turns the current game state into the data sent to /api/hint. */
export function buildHintRequest(
  level: Level,
  placement: Placement,
  hintLevel: number,
  lang: 'en' | 'ms',
): HintRequest {
  const result = checkSolution(level, placement);
  const solution = closestSolution(level, placement);

  return {
    lang,
    hintLevel,
    level: { title: level.title[lang], concept: level.concept[lang], grid: level.grid },
    sources: level.sources.map((source) => source.id),
    slots: level.slots.map((slot) => ({
      id: slot.id,
      pos: [slot.pos[0], slot.pos[1]],
      inputs: level.wires.filter((wire) => wire.to === slot.id).map((wire) => wire.from),
      placed: slot.fixedGate ?? placement[slot.id] ?? null,
      correct: slot.fixedGate ?? solution[slot.id] ?? 'AND',
      locked: slot.fixedGate !== undefined,
    })),
    bulbs: level.bulbs.map((bulb) => ({
      id: bulb.id,
      from: level.wires.find((wire) => wire.to === bulb.id)?.from ?? '',
    })),
    toolbox: level.toolbox.map((item) => ({ gate: item.gate, count: item.count })),
    totalCases: result.cases.length,
    failingCases: result.cases
      .filter((testCase) => !testCase.passed)
      .slice(0, 16)
      .map((testCase) => ({
        inputs: testCase.inputs,
        wrong: testCase.bulbs
          .filter((bulb) => !bulb.correct)
          .map((bulb) => ({ bulb: bulb.id, expected: bulb.expected, actual: bulb.actual })),
      })),
  };
}