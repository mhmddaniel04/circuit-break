import { z } from 'zod';
import { checkCircuitStructure, GATE_TYPES } from '@/features/simulation';

const id = z.string().min(1);
const bit = z.union([z.literal(0), z.literal(1)]);
const gateType = z.enum(GATE_TYPES);
const position = z.tuple([z.number().int().min(0), z.number().int().min(0)]);
const localizedText = z.object({ en: z.string().min(1), ms: z.string().min(1) });

/** The shape of every level JSON file in src/levels/. */
export const levelSchema = z
  .object({
    id: z.string().regex(/^w\d+-l\d+$/, 'Level id must look like "w1-l1"'),
    world: z.number().int().min(1),
    order: z.number().int().min(1),
    title: localizedText,
    concept: localizedText,
    /** Fallback hint, shown when the AI hint is unavailable. */
    hint: localizedText,
    /** Which learning objective the level trains: 1 = evaluate gates, 2 = build/repair circuits. */
    objective: z.union([z.literal(1), z.literal(2)]),
    grid: z.object({ cols: z.number().int().min(2), rows: z.number().int().min(1) }),
    sources: z.array(z.object({ id, pos: position, value: bit })).min(1),
    bulbs: z.array(z.object({ id, pos: position, target: bit })).min(1),
    slots: z.array(
      z.object({
        id,
        pos: position,
        /** Locked gate the player cannot change. */
        fixedGate: gateType.optional(),
        /** Gate already on the board at the start, which the player can replace (repair levels). */
        initialGate: gateType.optional(),
      }),
    ),
    wires: z.array(z.object({ from: id, to: id, port: z.number().int().min(0).max(1).optional() })),
    cases: z
      .array(z.object({ inputs: z.record(z.string(), bit), targets: z.record(z.string(), bit) }))
      .optional(),
    toolbox: z.array(z.object({ gate: gateType, count: z.number().int().min(1) })),
    par: z.object({ gates: z.number().int().min(0), seconds: z.number().int().min(1) }),
  })
  .superRefine((level, ctx) => {
    const report = (message: string) => ctx.addIssue({ code: 'custom', message });

    checkCircuitStructure(level).forEach(report);

    const taken = new Set<string>();
    for (const node of [...level.sources, ...level.slots, ...level.bulbs]) {
      const [col, row] = node.pos;
      if (col >= level.grid.cols || row >= level.grid.rows) {
        report(
          `"${node.id}" at [${col}, ${row}] is outside the ${level.grid.cols}×${level.grid.rows} grid`,
        );
      }
      const key = `${col},${row}`;
      if (taken.has(key)) {
        report(`"${node.id}" is on the same tile [${col}, ${row}] as another node`);
      }
      taken.add(key);
    }

    const sourceIds = new Set(level.sources.map((source) => source.id));
    level.cases?.forEach((testCase, index) => {
      for (const sourceId of Object.keys(testCase.inputs)) {
        if (!sourceIds.has(sourceId)) report(`Case ${index + 1}: unknown source "${sourceId}"`);
      }
      for (const bulb of level.bulbs) {
        if (!(bulb.id in testCase.targets)) {
          report(`Case ${index + 1}: missing target for bulb "${bulb.id}"`);
        }
      }
    });

    const openSlots = level.slots.filter((slot) => !slot.fixedGate).length;
    const gatesAvailable = level.toolbox.reduce((sum, item) => sum + item.count, 0);
    if (gatesAvailable < openSlots) {
      report(`Toolbox has ${gatesAvailable} gate(s) but there are ${openSlots} open slot(s)`);
    }
  });

export type Level = z.infer<typeof levelSchema>;

/** Checks raw JSON and returns a typed level. Throws a readable error if the file is wrong. */
export function parseLevel(data: unknown): Level {
  return levelSchema.parse(data);
}
