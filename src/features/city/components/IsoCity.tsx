import { useMemo } from 'react';
import { cx } from '@/lib/cx';
import type { DistrictStatus } from '../districts';
import {
  CITY_VIEWBOX,
  districtShapes,
  DRAW_ORDER,
  groundPath,
  groundShapes,
  LINKS,
} from '../isometric';
import styles from './IsoCity.module.css';

interface IsoCityProps {
  districts: DistrictStatus[];
  selected: number;
}

/** The 2.5D city drawing. Decorative: the district buttons on top of it carry the meaning. */
export function IsoCity({ districts, selected }: IsoCityProps) {
  const ground = useMemo(() => groundShapes(), []);
  const byWorld = new Map(districts.map((district) => [district.world, district]));

  return (
    <svg
      className={styles.city}
      viewBox={`0 0 ${CITY_VIEWBOX.width} ${CITY_VIEWBOX.height}`}
      aria-hidden="true"
    >
      <ellipse className={styles.shadow} cx={400} cy={590} rx={380} ry={30} />
      {ground.map((shape, i) => (
        <polygon key={i} className={styles[shape.tone]} points={shape.points} />
      ))}

      {LINKS.map((link) => {
        const lit = byWorld.get(link.from)?.look === 'powered';
        const d = groundPath(link.route);
        return (
          <g key={link.from} className={cx(styles.link, lit && styles.linkLit)}>
            <path className={styles.linkTrack} d={d} />
            {lit && <path className={styles.linkFlow} d={d} />}
          </g>
        );
      })}

      {DRAW_ORDER.map((world) => {
        const district = byWorld.get(world);
        if (!district) return null;
        const lit = district.levels.length ? district.done / district.levels.length : 0;
        return (
          <g
            key={world}
            className={cx(district.look === 'powered' && styles.glow)}
            data-district={world}
            data-look={district.look}
          >
            {districtShapes(world, district.look, lit, world === selected).map((shape, i) => (
              <polygon key={i} className={styles[shape.tone]} points={shape.points} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
