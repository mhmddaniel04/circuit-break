/** A binary signal: 0 = off, 1 = on. */
export type Bit = 0 | 1;

/** A signal that may be missing: null = no power reaches this point (empty slot or broken wire). */
export type Signal = Bit | null;

export const GATE_TYPES = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'] as const;
export type GateType = (typeof GATE_TYPES)[number];

/** A power source on the left side of the board. */
export interface SourceNode {
  id: string;
  value: Bit;
}

/** A target lightbulb on the right side of the board. */
export interface BulbNode {
  id: string;
  target: Bit;
}

/** A tile where a gate goes. `fixedGate` means the gate is pre-placed and locked. */
export interface SlotNode {
  id: string;
  fixedGate?: GateType;
}

/** Connects the output of `from` to input number `port` (0 or 1) of `to`. */
export interface Wire {
  from: string;
  to: string;
  port?: number;
}

/** One set of source values and the bulb states they must produce. */
export interface TestCase {
  inputs: Record<string, Bit>;
  targets: Record<string, Bit>;
}

/** The logical part of a level. The engine ignores positions, titles, etc. */
export interface Circuit {
  readonly sources: readonly SourceNode[];
  readonly bulbs: readonly BulbNode[];
  readonly slots: readonly SlotNode[];
  readonly wires: readonly Wire[];
  /** Optional truth-table cases. Without them, the level uses the source values and bulb targets. */
  readonly cases?: readonly TestCase[];
}

/** Gates the player has placed: slotId → gate. */
export type Placement = Partial<Record<string, GateType>>;

/** How many of each gate the player may use in a level. */
export interface ToolboxItem {
  gate: GateType;
  count: number;
}
