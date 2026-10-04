import type { JSX } from 'react';
import { SLOTS_PER_GROUP, type BuildView } from '../build/build';
import type { Mutagen } from '../catalog/catalog';
import { mutagenIconUrl } from './asset-urls';
import { mutagenColour } from './colours';
import {
  MUTAGEN_SLOT_SIZE,
  SLOT_SIZE,
  bracketX,
  groupHeaderBox,
  isRightGroup,
  mutagenSlotCentre,
  slotCentre,
} from './geometry';

// The bracket joins a group's three slots to its mutagen. The way from each slot that matches the
// mutagen takes the mutagen's colour, the rest of the bracket stays grey.
export function GroupBracket({
  group,
  build,
  mutagen,
}: {
  group: number;
  build: BuildView;
  mutagen: Mutagen | undefined;
}): JSX.Element {
  const side = isRightGroup(group) ? 1 : -1;
  const first = group * SLOTS_PER_GROUP;
  const [top = 0, middle = 0, bottom = 0] = [0, 1, 2].map((i) => slotCentre(first + i)[1]);
  const edge = slotCentre(first)[0] + (side * SLOT_SIZE) / 2;
  const spine = bracketX(group);
  // The diamond's corner that faces the slots.
  const corner = mutagenSlotCentre(group)[0] - (side * MUTAGEN_SLOT_SIZE) / Math.SQRT2;
  const [topMatches = false, middleMatches = false, bottomMatches = false] = [0, 1, 2].map(
    (i) => mutagen !== undefined && build.slotMatchesMutagen(first + i),
  );
  const segments: readonly (readonly [path: string, matches: boolean])[] = [
    [`M${edge} ${top} H${spine} V${middle}`, topMatches],
    [`M${edge} ${bottom} H${spine} V${middle}`, bottomMatches],
    [`M${edge} ${middle} H${spine}`, middleMatches],
    [`M${spine} ${middle} H${corner}`, topMatches || middleMatches || bottomMatches],
  ];
  const lit = segments.filter(([, matches]) => matches).map(([path]) => path);
  return (
    <>
      <path className="bracket" d={segments.map(([path]) => path).join(' ')} />
      {mutagen !== undefined && lit.length > 0 && (
        <path
          className="bracket filled"
          style={{ stroke: mutagenColour(mutagen) }}
          d={lit.join(' ')}
        />
      )}
    </>
  );
}

// The bar over a group, with its mutagen bonus as the game shows it.
export function GroupHeader({ group, build }: { group: number; build: BuildView }): JSX.Element {
  const right = isRightGroup(group);
  const box = groupHeaderBox(group);
  const bonus = build.mutagenBonus(group);
  const side = right ? ' right' : '';

  if (bonus === null) {
    return (
      <div className={`group-header empty${side}`} style={box}>
        No mutagen
      </div>
    );
  }

  const { mutagen, value } = bonus;
  const icon = <img src={mutagenIconUrl(mutagen)} alt="" draggable={false} />;
  const effect = (
    <span className="group-effect">
      {mutagen.effect}{' '}
      <b>
        +{value}
        {mutagen.unit}
      </b>
    </span>
  );
  return (
    <div className={`group-header${side}`} style={{ ...box, color: mutagenColour(mutagen) }}>
      {right ? (
        <>
          {effect}
          {icon}
        </>
      ) : (
        <>
          {icon}
          {effect}
        </>
      )}
    </div>
  );
}
