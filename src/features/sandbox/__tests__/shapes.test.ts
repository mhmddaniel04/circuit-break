import { expressionToSpeech } from '@/features/practice';
import { getTestCases } from '@/features/simulation';
import { levelSchema } from '@/levels/schema';
import { sandboxExpression, SANDBOX_SHAPES } from '../shapes';

const byId = (id: string) => SANDBOX_SHAPES.find((shape) => shape.id === `sandbox-${id}`)!;

describe('SANDBOX_SHAPES', () => {
  it.each(SANDBOX_SHAPES)('$id is a valid board with every input combination', (shape) => {
    // Sandbox shapes belong to no district, so give them a pretend id and world for the check.
    const result = levelSchema.safeParse({ ...shape, id: 'w9-l1', world: 9 });
    expect(result.error?.issues ?? []).toEqual([]);
    expect(getTestCases(shape)).toHaveLength(2 ** shape.sources.length);
  });
});

describe('sandboxExpression', () => {
  it('waits until every slot has a gate', () => {
    expect(sandboxExpression(byId('chain'), { P: 'AND' })).toBeNull();
  });

  it('writes the Boolean expression of what was built', () => {
    const tokens = sandboxExpression(byId('chain'), { P: 'NAND', Q: 'OR' });
    expect(expressionToSpeech(tokens!)).toBe('NOT (A AND B) OR C');
    const tree = sandboxExpression(byId('tree'), { P: 'AND', Q: 'AND', R: 'XOR' });
    expect(expressionToSpeech(tree!)).toBe('(A AND B) XOR (C AND D)');
  });
});
