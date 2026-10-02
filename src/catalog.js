// The static game data joined into lookups: skills with their prerequisites and unlocks, mutagens and mutations by id.
function createCatalog({ skillTrees, treeLayout, mutagens, mutations, extraSlotUnlocks }) {
  const skillKey = (tree, name) => `${tree}/${name}`;
  const skillsByKey = new Map();
  const skills = [];

  const trees = skillTrees.map(({ tree, skills: entries }) => ({
    name: tree,
    links: [],
    skills: entries.map(({ name, ranks }) => {
      const skill = { index: skills.length, tree, name, ranks, position: treeLayout[tree].nodes[name], requires: [], unlocks: [] };
      skills.push(skill);
      skillsByKey.set(skillKey(tree, name), skill);
      return skill;
    })
  }));

  for (const tree of trees) {
    for (const [parentName, childName] of treeLayout[tree.name].links) {
      const parent = skillsByKey.get(skillKey(tree.name, parentName));
      const child = skillsByKey.get(skillKey(tree.name, childName));
      parent.unlocks.push(child);
      child.requires.push(parent);
      tree.links.push([parent, child]);
    }
  }

  const mutagenList = Object.entries(mutagens).map(([id, mutagen]) => ({ id, ...mutagen }));
  const mutationList = Object.entries(mutations).map(([id, mutation]) => ({ id, innate: false, ...mutation }));
  const mutagensById = new Map(mutagenList.map(mutagen => [mutagen.id, mutagen]));
  const mutationsById = new Map(mutationList.map(mutation => [mutation.id, mutation]));

  return {
    trees,
    skills,
    mutagens: mutagenList,
    mutations: mutationList,
    extraSlotUnlocks,
    tree: name => trees.find(tree => tree.name === name) ?? null,
    skill: (tree, name) => skillsByKey.get(skillKey(tree, name)) ?? null,
    mutagen: id => mutagensById.get(id) ?? null,
    mutation: id => mutationsById.get(id) ?? null
  };
}
