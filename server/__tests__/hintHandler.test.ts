// @vitest-environment node
import { sampleHintRequest } from './fixtures.js';
import { cleanHint, handleHintRequest } from '../hintHandler.js';

const validBody = sampleHintRequest;

describe('handleHintRequest', () => {
  it('rejects a body that does not match the schema', async () => {
    const generate = vi.fn();
    const result = await handleHintRequest({ hello: 'world' }, generate);
    expect(result).toEqual({ status: 400, body: { error: 'invalid_request' } });
    expect(generate).not.toHaveBeenCalled();
  });

  it('returns the generated hint', async () => {
    const generate = vi.fn().mockResolvedValue('  Look at the row where A = 0 and B = 1.  ');
    const result = await handleHintRequest(validBody, generate);
    expect(result).toEqual({
      status: 200,
      body: { hint: 'Look at the row where A = 0 and B = 1.' },
    });
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ system: expect.any(String), user: expect.any(String) }),
    );
  });

  it('reports when the AI fails or returns nothing', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('network down'));
    expect((await handleHintRequest(validBody, failing)).status).toBe(502);
    const empty = vi.fn().mockResolvedValue('   ');
    expect((await handleHintRequest(validBody, empty)).body).toEqual({ error: 'empty_hint' });
  });
});

describe('cleanHint', () => {
  it('removes markdown and extra spaces', () => {
    expect(cleanHint('**Check** the   _second_ gate.\n')).toBe('Check the second gate.');
  });

  it('cuts very long answers', () => {
    expect(cleanHint('a'.repeat(1000))).toHaveLength(400);
  });
});
