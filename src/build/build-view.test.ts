import { describe, expectTypeOf, it } from 'vitest';
import type { BuildView } from './build';

// Checked by the type check: a component handed a BuildView cannot change the build it reads.
describe('BuildView', () => {
  it('reads a build without any of its commands', () => {
    expectTypeOf<BuildView>().toHaveProperty('rank');
    expectTypeOf<BuildView>().toHaveProperty('maxToxicity');
    expectTypeOf<BuildView>().not.toHaveProperty('addPoint');
    expectTypeOf<BuildView>().not.toHaveProperty('placeSkill');
    expectTypeOf<BuildView>().not.toHaveProperty('clone');
  });

  it('reads the gear and the toxicity plan without their commands', () => {
    expectTypeOf<BuildView['gear']>().toHaveProperty('itemAt');
    expectTypeOf<BuildView['gear']>().not.toHaveProperty('equip');
    expectTypeOf<BuildView['toxicityPlan']>().toHaveProperty('toxicity');
    expectTypeOf<BuildView['toxicityPlan']>().not.toHaveProperty('activateDecoction');
  });
});
