import { describe, expect, it } from 'vitest';
import { createGameCatalog } from '../catalog/game-catalog';
import { Build } from './build';
import { createBuildCodec } from './build-code';

const catalog = createGameCatalog();
const codec = createBuildCodec(catalog);

// Codes made by the 1.x vanilla planner. They must keep opening the same build.
const COMBAT_SIGNS_CODE = 'W3R1.yAEABAAgBAAAAAAAAAAAAAEAACAABAbAAAAAAAIAAAAAAAAAABOADAAAAAADAAHBrG';
const ALCHEMY_GENERAL_CODE =
  'W3R1.AAAAAAAAAAAAADAsIAAAAQAAAMAAvAqAyBNBAAAAuAAAAAAAAAAAAAAAAAAJCHAAAA';

const decodeBuild = (code: string): Build => {
  const snapshot = codec.decode(code);
  if (snapshot === null) throw new Error(`Test code does not decode: ${code}`);
  return Build.fromSnapshot(catalog, snapshot);
};

describe('createBuildCodec', () => {
  it('encodes a 1.x code back to the same characters', () => {
    const codes = [COMBAT_SIGNS_CODE, ALCHEMY_GENERAL_CODE];

    const reencoded = codes.map((code) => codec.encode(decodeBuild(code)));

    expect(reencoded).toEqual(codes);
  });

  it('opens a 1.x combat and signs code as the same build', () => {
    const build = decodeBuild(COMBAT_SIGNS_CODE);

    const filledSlots = Array.from({ length: build.slotCount }, (_, i) => build.slotAt(i)).filter(
      (skill) => skill !== null,
    );

    expect(build.totalPoints()).toBe(27);
    expect(build.slottedMutation).toBe('adrenaline-rush');
    expect(filledSlots).toHaveLength(5);
    expect(build.slotAt(12)?.name).toBe('Three Strikes');
    expect([build.mutagenBonus(0)?.value, build.mutagenBonus(3)?.value]).toEqual([20, 50]);
  });

  it('opens a 1.x alchemy and general code with its mutagen bonuses', () => {
    const build = decodeBuild(ALCHEMY_GENERAL_CODE);

    const bonuses = [0, 1, 2].map((group) => build.mutagenBonus(group)?.value);

    expect(build.totalPoints()).toBe(14);
    expect(bonuses).toEqual([600, 7, 100]);
  });

  it('rejects text that is not a whole build code', () => {
    const inputs = ['garbage', COMBAT_SIGNS_CODE.slice(0, -1), `${COMBAT_SIGNS_CODE}A`, 'W3R1.!'];

    const decoded = inputs.map((input) => codec.decode(input));

    expect(decoded).toEqual([null, null, null, null]);
  });
});
