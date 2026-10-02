const MAX_RANK = 3;
const BASE_SLOTS = 12;
const SLOTS_PER_GROUP = 3;
const MUTAGEN_GROUPS = BASE_SLOTS / SLOTS_PER_GROUP;
// While it sits in a slot, Synergy raises every mutagen bonus by 10% per rank.
const SYNERGY = { tree: "General", name: "Synergy", bonusPerRank: 0.1 };

const slotGroup = slotIndex => Math.floor(slotIndex / SLOTS_PER_GROUP);

// One character build: skill ranks, slotted skills, mutagens and mutations.
// Every command leaves the build valid, so callers never have to repair it.
class Build {
  #catalog;
  #ranks = new Map();
  #slots;
  #mutagens = Array(MUTAGEN_GROUPS).fill(null);
  #researched = new Set();
  #mutation = null;

  constructor(catalog) {
    this.#catalog = catalog;
    this.#slots = Array(BASE_SLOTS + catalog.extraSlotUnlocks.length).fill(null);
  }

  // Reads a saved or decoded build, skipping anything unknown or against the rules.
  static fromSnapshot(catalog, snapshot) {
    const build = new Build(catalog);
    for (const [tree, ranks] of Object.entries(snapshot?.points ?? {})) {
      for (const [name, rank] of Object.entries(ranks ?? {})) {
        const skill = catalog.skill(tree, name);
        const value = Math.min(MAX_RANK, Math.max(0, Math.trunc(rank) || 0));
        if (skill && value > 0) build.#ranks.set(skill, value);
      }
    }
    for (const id of snapshot?.researched ?? []) {
      if (catalog.mutation(id)?.innate === false) build.#researched.add(id);
    }
    build.#mutation = snapshot?.mutation ?? null;
    (snapshot?.mutagens ?? []).slice(0, MUTAGEN_GROUPS).forEach((id, group) => {
      if (catalog.mutagen(id)) build.#mutagens[group] = id;
    });
    (snapshot?.slots ?? []).slice(0, build.slotCount).forEach((entry, index) => {
      const skill = entry && catalog.skill(entry.tree, entry.name);
      if (skill && build.slotOf(skill) < 0) build.#slots[index] = skill;
    });
    build.#normalize();
    return build;
  }

  toSnapshot() {
    const points = {};
    for (const [skill, rank] of this.#ranks) (points[skill.tree] ??= {})[skill.name] = rank;
    return {
      points,
      slots: this.#slots.map(skill => skill && { tree: skill.tree, name: skill.name }),
      mutagens: [...this.#mutagens],
      researched: [...this.#researched],
      mutation: this.#mutation
    };
  }

  // --- Skill points

  rank(skill) {
    return this.#ranks.get(skill) ?? 0;
  }

  treePoints(treeName) {
    return this.#catalog.tree(treeName).skills.reduce((sum, skill) => sum + this.rank(skill), 0);
  }

  totalPoints() {
    let sum = this.researchCost();
    for (const rank of this.#ranks.values()) sum += rank;
    return sum;
  }

  unslottedPoints() {
    let sum = 0;
    for (const [skill, rank] of this.#ranks) if (this.slotOf(skill) < 0) sum += rank;
    return sum;
  }

  isAvailable(skill) {
    return skill.requires.length === 0 || skill.requires.some(parent => this.rank(parent) > 0);
  }

  canAddPoint(skill) {
    return this.rank(skill) < MAX_RANK && this.isAvailable(skill);
  }

  // The last point stays while a learned skill has no other learned parent to keep it unlocked.
  canRemovePoint(skill) {
    const rank = this.rank(skill);
    if (rank === 0) return false;
    if (rank > 1) return true;
    return skill.unlocks.every(child =>
      this.rank(child) === 0 || child.requires.some(parent => parent !== skill && this.rank(parent) > 0));
  }

  addPoint(skill) {
    if (this.canAddPoint(skill)) this.#ranks.set(skill, this.rank(skill) + 1);
  }

  removePoint(skill) {
    if (!this.canRemovePoint(skill)) return;
    const rank = this.rank(skill) - 1;
    if (rank > 0) this.#ranks.set(skill, rank);
    else this.#ranks.delete(skill);
    this.#normalize();
  }

  resetTree(treeName) {
    for (const skill of this.#catalog.tree(treeName).skills) this.#ranks.delete(skill);
    this.#normalize();
  }

  // --- Skill slots

  get slotCount() {
    return this.#slots.length;
  }

  slotAt(index) {
    return this.#slots[index];
  }

  slotOf(skill) {
    return this.#slots.indexOf(skill);
  }

  isSlotUnlocked(index) {
    return index < BASE_SLOTS || this.researchedCount >= this.#catalog.extraSlotUnlocks[index - BASE_SLOTS];
  }

  // The trees the extra slots take: the colours of the slotted mutation.
  extraSlotTrees() {
    return this.#catalog.mutation(this.#mutation)?.trees ?? [];
  }

  slotAccepts(index, skill) {
    if (!this.isSlotUnlocked(index) || this.rank(skill) === 0) return false;
    return index < BASE_SLOTS || this.extraSlotTrees().includes(skill.tree);
  }

  placeSkill(skill, index) {
    const from = this.slotOf(skill);
    const displaced = this.#slots[index];
    if (from === index || !this.slotAccepts(index, skill)) return;
    if (from >= 0) {
      // A move swaps the two slots, and only when the displaced skill also fits the slot being vacated.
      if (displaced && !this.slotAccepts(from, displaced)) return;
      this.#slots[from] = displaced;
    }
    this.#slots[index] = skill;
  }

  unslot(index) {
    this.#slots[index] = null;
  }

  // --- Mutagens

  get mutagenCount() {
    return this.#mutagens.filter(Boolean).length;
  }

  mutagenAt(group) {
    return this.#mutagens[group];
  }

  placeMutagen(id, group) {
    if (this.#catalog.mutagen(id)) this.#mutagens[group] = id;
  }

  moveMutagen(fromGroup, toGroup) {
    [this.#mutagens[fromGroup], this.#mutagens[toGroup]] = [this.#mutagens[toGroup], this.#mutagens[fromGroup]];
  }

  removeMutagen(group) {
    this.#mutagens[group] = null;
  }

  resetMutagens() {
    this.#mutagens.fill(null);
  }

  slotMatchesMutagen(index) {
    if (index >= BASE_SLOTS) return false;
    const mutagen = this.#catalog.mutagen(this.#mutagens[slotGroup(index)]);
    return mutagen !== null && this.#slots[index]?.tree === mutagen.tree;
  }

  // Every skill of the mutagen's colour in the same group adds the base bonus once more.
  mutagenBonus(group) {
    const mutagen = this.#catalog.mutagen(this.#mutagens[group]);
    if (!mutagen) return null;
    const groupSlots = this.#slots.slice(group * SLOTS_PER_GROUP, (group + 1) * SLOTS_PER_GROUP);
    const matching = groupSlots.filter(skill => skill?.tree === mutagen.tree).length;
    const synergySkill = this.#catalog.skill(SYNERGY.tree, SYNERGY.name);
    const synergy = this.slotOf(synergySkill) >= 0 ? this.rank(synergySkill) : 0;
    const value = Math.floor(mutagen.bonus * (1 + matching) * (1 + synergy * SYNERGY.bonusPerRank));
    return { mutagen, matching, synergy, value };
  }

  // --- Mutations

  get researchedCount() {
    return this.#researched.size;
  }

  get slottedMutation() {
    return this.#mutation;
  }

  researchCost() {
    let sum = 0;
    for (const id of this.#researched) sum += this.#catalog.mutation(id).cost;
    return sum;
  }

  isResearched(id) {
    return this.#researched.has(id) || this.#catalog.mutation(id)?.innate === true;
  }

  canResearch(id) {
    return !this.isResearched(id) && this.#requirementsResearched(id);
  }

  // A mutation stays while another researched mutation requires it.
  canUnresearch(id) {
    return this.#researched.has(id)
      && ![...this.#researched].some(other => this.#catalog.mutation(other).requires.includes(id));
  }

  canSlotMutation(id) {
    return this.#researched.has(id);
  }

  research(id) {
    if (this.canResearch(id)) this.#researched.add(id);
  }

  unresearch(id) {
    if (!this.canUnresearch(id)) return;
    this.#researched.delete(id);
    this.#normalize();
  }

  slotMutation(id) {
    if (!this.canSlotMutation(id)) return;
    this.#mutation = id;
    this.#normalize();
  }

  unslotMutation() {
    this.#mutation = null;
    this.#normalize();
  }

  resetMutations() {
    this.#researched.clear();
    this.#mutation = null;
    this.#normalize();
  }

  #requirementsResearched(id) {
    return this.#catalog.mutation(id).requires.every(required => this.isResearched(required));
  }

  // Drops whatever the rules no longer allow. Removals can cascade, so it repeats until nothing changes.
  #normalize() {
    for (let changed = true; changed;) {
      changed = false;
      for (const skill of this.#ranks.keys()) {
        if (!this.isAvailable(skill)) {
          this.#ranks.delete(skill);
          changed = true;
        }
      }
      for (const id of this.#researched) {
        if (!this.#requirementsResearched(id)) {
          this.#researched.delete(id);
          changed = true;
        }
      }
    }
    if (!this.#researched.has(this.#mutation)) this.#mutation = null;
    this.#slots = this.#slots.map((skill, index) => skill && this.slotAccepts(index, skill) ? skill : null);
  }
}
