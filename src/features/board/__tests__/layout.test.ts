import { getLevel } from '@/levels';
import { boardSize, cellCenter, layoutWires, wirePath } from '../layout';

describe('layout', () => {
  it('puts a node in the middle of its tile', () => {
    expect(cellCenter([0, 0])).toEqual({ x: 50, y: 50 });
    expect(cellCenter([2, 1])).toEqual({ x: 250, y: 150 });
  });

  it('draws a straight wire when both ends are on the same row', () => {
    expect(wirePath({ x: 0, y: 50 }, { x: 100, y: 50 })).toBe('M 0 50 H 100');
  });

  it('draws a stepped wire when the ends are on different rows', () => {
    expect(wirePath({ x: 0, y: 50 }, { x: 100, y: 150 })).toBe('M 0 50 H 50 V 150 H 100');
  });

  it('lays out one path per wire and sizes the board from the grid', () => {
    const level = getLevel('w2-l1')!;
    expect(layoutWires(level)).toHaveLength(level.wires.length);
    expect(boardSize(level)).toEqual({ width: 500, height: 400 });
  });
});
