import {
  ALCHEMY_RECIPES,
  MANTICORE_ARMOR,
  type DecoctionData,
  type PotionData,
} from '../data/alchemy';

// The potions and decoctions planned to be active together, and the alchemy behind them: the recipes
// known, and the Manticore armor pieces a code from before the gear carries.
export class ToxicityPlan {
  #potions = new Map<PotionData, number>();
  #decoctions = new Set<DecoctionData>();
  #manticorePieces = 0;
  #knownRecipes: number = ALCHEMY_RECIPES;

  clone(): ToxicityPlan {
    const copy = new ToxicityPlan();
    copy.#potions = new Map(this.#potions);
    copy.#decoctions = new Set(this.#decoctions);
    copy.#manticorePieces = this.#manticorePieces;
    copy.#knownRecipes = this.#knownRecipes;
    return copy;
  }

  isEmpty(): boolean {
    return (
      this.#potions.size === 0 &&
      this.#decoctions.size === 0 &&
      this.#manticorePieces === 0 &&
      this.#knownRecipes === ALCHEMY_RECIPES
    );
  }

  // The active version of a potion: 0 for none, then the base, enhanced and superior one.
  potionTier(potion: PotionData): number {
    return this.#potions.get(potion) ?? 0;
  }

  setPotionTier(potion: PotionData, tier: number): void {
    const value = Math.min(potion.tiers.length, Math.max(0, Math.trunc(tier)));
    if (value > 0) this.#potions.set(potion, value);
    else this.#potions.delete(potion);
  }

  isDecoctionActive(decoction: DecoctionData): boolean {
    return this.#decoctions.has(decoction);
  }

  activateDecoction(decoction: DecoctionData): void {
    this.#decoctions.add(decoction);
  }

  deactivateDecoction(decoction: DecoctionData): void {
    this.#decoctions.delete(decoction);
  }

  // The game refuses a potion or decoction whose Toxicity would take the total above the maximum. The
  // plan can still end up above it when the maximum drops later, which the planner shows as a warning.
  canSetPotionTier(potion: PotionData, tier: number, maximum: number): boolean {
    const held = potion.tiers[this.potionTier(potion) - 1]?.toxicity ?? 0;
    const next = potion.tiers[tier - 1]?.toxicity ?? 0;
    return next <= held || this.toxicity() - held + next <= maximum;
  }

  canActivateDecoction(decoction: DecoctionData, maximum: number): boolean {
    return this.isDecoctionActive(decoction) || this.toxicity() + decoction.toxicity <= maximum;
  }

  // Everything active at once: a decoction holds its Toxicity for as long as it lasts.
  toxicity(): number {
    let sum = 0;
    for (const [potion, tier] of this.#potions) sum += potion.tiers[tier - 1]?.toxicity ?? 0;
    for (const decoction of this.#decoctions) sum += decoction.toxicity;
    return sum;
  }

  // Armor worn on the Gear tab takes the place of this count, see Build.manticorePieces.
  get manticorePieces(): number {
    return this.#manticorePieces;
  }

  setManticorePieces(pieces: number): void {
    this.#manticorePieces = Math.min(MANTICORE_ARMOR.pieces, Math.max(0, Math.trunc(pieces)));
  }

  get knownRecipes(): number {
    return this.#knownRecipes;
  }

  setKnownRecipes(count: number): void {
    this.#knownRecipes = Math.min(ALCHEMY_RECIPES, Math.max(0, Math.trunc(count)));
  }

  // The potions and decoctions go, what is known stays.
  clearElixirs(): void {
    this.#potions.clear();
    this.#decoctions.clear();
  }
}
