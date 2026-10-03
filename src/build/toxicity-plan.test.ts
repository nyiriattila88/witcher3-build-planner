import { describe, expect, it } from 'vitest';
import { createGameCatalog } from '../catalog/game-catalog';
import type { DecoctionData, PotionData } from '../data/alchemy';
import { ToxicityPlan } from './toxicity-plan';

const catalog = createGameCatalog();

const potion = (name: string): PotionData => {
  const found = catalog.potions.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names an unknown potion: ${name}`);
  return found;
};

const decoction = (name: string): DecoctionData => {
  const found = catalog.decoctions.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names an unknown decoction: ${name}`);
  return found;
};

describe('ToxicityPlan', () => {
  it('adds up the Toxicity of everything active at once', () => {
    const plan = new ToxicityPlan();
    plan.setPotionTier(potion('Swallow'), 3);
    plan.setPotionTier(potion('Thunderbolt'), 1);
    plan.activateDecoction(decoction('Water hag decoction'));

    const toxicity = plan.toxicity();

    expect(toxicity).toBe(20 + 25 + 50);
  });

  it('takes a decoction off again', () => {
    const plan = new ToxicityPlan();
    const waterHag = decoction('Water hag decoction');
    plan.activateDecoction(waterHag);

    plan.deactivateDecoction(waterHag);

    expect([plan.isDecoctionActive(waterHag), plan.toxicity()]).toEqual([false, 0]);
  });

  it('lets a potion or decoction in only while the total stays within the maximum', () => {
    const plan = new ToxicityPlan();
    plan.activateDecoction(decoction('Water hag decoction'));
    plan.activateDecoction(decoction('Katakan decoction'));
    const maximum = 100;

    const allowed = [
      plan.canActivateDecoction(decoction('Griffin decoction'), maximum),
      plan.canSetPotionTier(potion('Swallow'), 1, maximum),
      plan.canSetPotionTier(potion('White Honey'), 1, maximum),
      plan.canActivateDecoction(decoction('Katakan decoction'), maximum),
    ];

    expect(allowed).toEqual([false, false, true, true]);
  });

  it('keeps every value in the range the game allows', () => {
    const plan = new ToxicityPlan();
    plan.setPotionTier(potion('Killer Whale'), 3);
    plan.setManticorePieces(9);
    plan.setKnownRecipes(-5);

    const values = [
      plan.potionTier(potion('Killer Whale')),
      plan.manticorePieces,
      plan.knownRecipes,
    ];

    expect(values).toEqual([1, 4, 0]);
  });

  it('clears the potions and decoctions but keeps the recipes known', () => {
    const plan = new ToxicityPlan();
    plan.setPotionTier(potion('Swallow'), 2);
    plan.activateDecoction(decoction('Water hag decoction'));
    plan.setKnownRecipes(40);

    plan.clearElixirs();

    expect([plan.toxicity(), plan.knownRecipes, plan.isEmpty()]).toEqual([0, 40, false]);
  });
});
