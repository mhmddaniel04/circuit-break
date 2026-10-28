import { GATE_TYPES, type GateType } from '@/features/simulation';

/** Data type used when dragging a gate from the toolbox onto the board. */
export const GATE_DRAG_TYPE = 'application/x-circuit-gate';

export function isGateType(value: string): value is GateType {
  return (GATE_TYPES as readonly string[]).includes(value);
}
