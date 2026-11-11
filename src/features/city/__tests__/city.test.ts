import { getLevelsByWorld } from '@/levels';
import { currentDistrict, DISTRICTS, getDistrictStatus } from '../districts';
import { districtShapes, DRAW_ORDER, project, tagPosition } from '../isometric';

const done = { stars: 3 as const, bestScore: 1000, bestSeconds: 10 };
const finish = (world: number) =>
  Object.fromEntries(getLevelsByWorld(world).map((level) => [level.id, done]));

describe('isometric drawing', () => {
  it('moves right and down for x, left and down for y, and up for z', () => {
    const origin = project([0, 0, 0]);
    expect(project([1, 0, 0]).x).toBeGreaterThan(origin.x);
    expect(project([0, 1, 0]).x).toBeLessThan(origin.x);
    expect(project([0, 0, 1]).y).toBeLessThan(origin.y);
  });

  it('draws the districts at the back first', () => {
    expect(DRAW_ORDER).toEqual([2, 1, 3, 4, 5]);
  });

  it('lights every window of a powered district and none of a locked one', () => {
    const windows = (look: 'powered' | 'locked') =>
      districtShapes(1, look, 0, false).filter((shape) => shape.tone.startsWith('window'));
    expect(windows('powered').every((shape) => shape.tone === 'windowOn')).toBe(true);
    expect(windows('locked').every((shape) => shape.tone === 'windowDark')).toBe(true);
  });

  it('lights about as many windows as the share of finished levels', () => {
    const shapes = districtShapes(3, 'active', 0.5, false).filter((s) =>
      s.tone.startsWith('window'),
    );
    const lit = shapes.filter((shape) => shape.tone === 'windowOn').length / shapes.length;
    expect(lit).toBeGreaterThan(0.3);
    expect(lit).toBeLessThan(0.7);
  });

  it('keeps every name tag inside the map', () => {
    for (const world of DISTRICTS) {
      const { x, y } = tagPosition(world);
      expect(x).toBeGreaterThan(60);
      expect(x).toBeLessThan(740);
      expect(y).toBeGreaterThan(40);
      expect(y).toBeLessThan(580);
    }
  });
});

describe('getDistrictStatus', () => {
  it('opens District 1 for a new player and keeps the others dark', () => {
    expect(getDistrictStatus(1, {}, {}).look).toBe('active');
    expect(getDistrictStatus(2, {}, {}).look).toBe('locked');
  });

  it('powers a district when all its levels are done, which opens the next one', () => {
    const records = finish(1);
    expect(getDistrictStatus(1, records, {})).toMatchObject({ look: 'powered', stars: 15 });
    expect(getDistrictStatus(2, records, {})).toMatchObject({ look: 'active', reachable: true });
  });

  it('chooses the first district that still needs work', () => {
    const statuses = (records: object) =>
      DISTRICTS.map((world) => getDistrictStatus(world, records, {}));
    expect(currentDistrict(statuses({}))).toBe(1);
    expect(currentDistrict(statuses({ ...finish(1), ...finish(2) }))).toBe(3);
  });
});
