// A build code is "W3R1." and a fixed-width base64url body: the skill ranks as base-4 digits, three per character,
// then every slot as skill index + 1 (two characters), every mutagen group as mutagen index + 1,
// the research bitmask (two characters) and the slotted mutation's index + 1.
function createBuildCodec(catalog) {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const PREFIX = "W3R1.";
  const skills = catalog.skills;
  const mutagenIds = catalog.mutagens.map(mutagen => mutagen.id);
  const mutationIds = catalog.mutations.filter(mutation => !mutation.innate).map(mutation => mutation.id);
  const slotCount = BASE_SLOTS + catalog.extraSlotUnlocks.length;
  const rankChars = Math.ceil(skills.length / 3);
  const bodyLength = rankChars + slotCount * 2 + MUTAGEN_GROUPS + 2 + 1;

  const single = value => ALPHABET[value];
  const double = value => ALPHABET[value >> 6] + ALPHABET[value & 63];

  function encode(build) {
    const ranks = skills.map(skill => build.rank(skill));
    let body = "";
    for (let i = 0; i < ranks.length; i += 3) body += single(16 * ranks[i] + 4 * (ranks[i + 1] ?? 0) + (ranks[i + 2] ?? 0));
    for (let i = 0; i < slotCount; i++) body += double((build.slotAt(i)?.index ?? -1) + 1);
    for (let group = 0; group < MUTAGEN_GROUPS; group++) body += single(mutagenIds.indexOf(build.mutagenAt(group)) + 1);
    body += double(mutationIds.reduce((mask, id, bit) => build.isResearched(id) ? mask | 1 << bit : mask, 0));
    body += single(mutationIds.indexOf(build.slottedMutation) + 1);
    return PREFIX + body;
  }

  // Returns a snapshot for Build.fromSnapshot, or null when the text is not a build code.
  function decode(text) {
    const code = String(text ?? "").trim();
    if (!code.startsWith(PREFIX)) return null;
    const body = code.slice(PREFIX.length);
    if (body.length !== bodyLength || [...body].some(char => !ALPHABET.includes(char))) return null;

    const singleAt = position => ALPHABET.indexOf(body[position]);
    const doubleAt = position => singleAt(position) * 64 + singleAt(position + 1);
    const points = {};
    skills.forEach((skill, i) => {
      const rank = Math.floor(singleAt(Math.floor(i / 3)) / [16, 4, 1][i % 3]) % 4;
      if (rank) (points[skill.tree] ??= {})[skill.name] = rank;
    });
    let position = rankChars;
    const slots = [];
    for (let i = 0; i < slotCount; i++, position += 2) {
      const skill = skills[doubleAt(position) - 1];
      slots.push(skill ? { tree: skill.tree, name: skill.name } : null);
    }
    const mutagens = [];
    for (let group = 0; group < MUTAGEN_GROUPS; group++, position++) mutagens.push(mutagenIds[singleAt(position) - 1] ?? null);
    const mask = doubleAt(position);
    const mutation = mutationIds[singleAt(position + 2) - 1] ?? null;
    return { points, slots, mutagens, researched: mutationIds.filter((id, bit) => mask & 1 << bit), mutation };
  }

  return { encode, decode };
}
