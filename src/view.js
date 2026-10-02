// Tree pane geometry. Node positions are screenshot pixels, scaled around the top-left node of the screenshots.
const TREE_SCALE = 1.45;
const SCREENSHOT_ORIGIN = [80, 62];
// The cleaned screenshot backdrops in images/backgrounds are all this wide.
const SCREENSHOT_WIDTH = 604;
const NODE_WIDTH = 108;
const NODE_HEIGHT = 94;
const ICON_SIZE = 66;
const TREE_PADDING = 10;
const PANE_WIDTH = 760;
const MUTATION_GRID = { left: 110, top: 70, column: 135, row: 125, radius: 38, height: 520 };

// Slot board geometry, laid out like the in-game character screen.
const BOARD_SIZE = [640, 610];
const SLOT_SIZE = 78;
const SLOT_POSITIONS = [
  [150, 20], [150, 105], [150, 190], [412, 20], [412, 105], [412, 190],
  [150, 340], [150, 425], [150, 510], [412, 340], [412, 425], [412, 510],
  [281, 105], [281, 20], [281, 425], [281, 510]
];
const MUTAGEN_SLOT_SIZE = 76;
const MUTAGEN_SLOT_CENTRES = [[75, 145], [565, 145], [75, 465], [565, 465]];
const MUTATION_SLOT_POSITION = [268, 252];

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const iconPath = skill => `images/${skill.tree.toLowerCase()}/${slug(skill.name)}.png`;
const treeColour = treeName => `var(--tree-${treeName.toLowerCase()})`;
const mutationColour = mutation => `var(--mut-${mutation.trees.join("-").toLowerCase()})`;
const mutagenColour = mutagen => `var(--mut-${mutagen.tree.toLowerCase()})`;
const mutagenEffect = (mutagen, value) => `${mutagen.effect} +${value}${mutagen.unit}`;
// The diamonds show the name without the word "Mutagen", the info panel and the summary show it whole.
const mutagenLabel = mutagen => mutagen.name.replace(/ Mutagen$/, "");
const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
// The Mutagens and Mutations backdrops are made at the size of their pane.
const paneBackground = name => ({ image: `url("images/backgrounds/${name}.jpg")`, size: "100% 100%", position: "0 0" });

function createView(catalog) {
  const byId = id => document.getElementById(id);

  const tabs = [
    ...catalog.trees.map(tree => ({ id: tree.name, label: `${tree.name} Skills`, colour: treeColour(tree.name), kind: "tree" })),
    { id: "Mutagens", label: "Mutagens", colour: "var(--tab-mutagens)", kind: "mutagens" },
    { id: "Mutations", label: "Mutations", colour: "var(--tab-mutations)", kind: "mutations" }
  ];
  const tab = id => tabs.find(candidate => candidate.id === id);

  // What each kind of tab shows: its counter, the label of the branch bar, the pane and the tip.
  const TAB_KINDS = {
    tree: {
      count: (build, current) => `${build.treePoints(current.id)} pts`,
      branchLabel: (build, current) => `Points in branch: ${build.treePoints(current.id)}`,
      pane: (build, current) => treePane(build, catalog.tree(current.id)),
      tip: "Geralt can only have a certain number of active skills regardless of the number of points assigned. "
        + "To make a skill active, drag it to a skill slot. Tip: pair skill slots with mutagens of the same colour for increased bonuses."
    },
    mutagens: {
      count: build => `${build.mutagenCount}/${MUTAGEN_GROUPS}`,
      branchLabel: () => "Drag to a mutagen slot",
      pane: () => mutagenPane(),
      tip: "Witchers can assign mutagens to their skill slots. Each mutagen provides a passive bonus, increased by every skill "
        + "of the matching colour in the same slot group. Drag a mutagen (diamond) to a mutagen slot."
    },
    mutations: {
      count: build => `${build.researchedCount} researched`,
      branchLabel: build => `Research cost total: ${build.researchCost()}`,
      pane: build => mutationPane(build),
      tip: "To slot a mutation, it must first be researched. Research costs skill points and requires every linked mutation below it. "
        + "Strengthened Synapses is always researched: it unlocks slots 13–16 at 2, 4, 8 and 12 researched mutations, "
        + "and those slots only take skills matching the slotted mutation's colours."
    }
  };

  function render(build, currentTabId) {
    const current = tab(currentTabId), kind = TAB_KINDS[current.kind];
    byId("title").textContent = buildTitle(build) || current.id;
    byId("tabs").innerHTML = tabs.map(candidate => tabHtml(build, candidate, current)).join("");
    byId("total").textContent = build.totalPoints();
    byId("unslotted").textContent = build.unslottedPoints();
    byId("branch").style.background = current.colour;
    byId("branch-name").textContent = current.id;
    byId("branch-label").textContent = kind.branchLabel(build, current);
    const pane = kind.pane(build, current), paneElement = byId("pane");
    paneElement.style.width = `${pane.width}px`;
    paneElement.style.height = pane.height ? `${pane.height}px` : "auto";
    paneElement.style.backgroundImage = pane.background?.image ?? "none";
    paneElement.style.backgroundSize = pane.background?.size ?? "";
    paneElement.style.backgroundPosition = pane.background?.position ?? "";
    paneElement.innerHTML = pane.html;
    byId("board").innerHTML = boardHtml(build);
    byId("summary").innerHTML = summaryHtml(build);
  }

  // Named after the two strongest colour trees and the slotted mutation, as the rpg-gaming planner does.
  function buildTitle(build) {
    const trees = ["Combat", "Signs", "Alchemy"]
      .map(name => [name, build.treePoints(name)])
      .filter(([, points]) => points > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);
    return [trees.join(" / "), catalog.mutation(build.slottedMutation)?.name].filter(Boolean).join(" - ");
  }

  function tabHtml(build, candidate, current) {
    return `<div class="tab${candidate === current ? " active" : ""}" data-tab="${candidate.id}" style="background:${candidate.colour}">`
      + `${candidate.label}<span class="tab-count">${TAB_KINDS[candidate.kind].count(build, candidate)}</span></div>`;
  }

  // --- Panes

  function treePane(build, tree) {
    const centre = skill => [
      TREE_PADDING + NODE_WIDTH / 2 + (skill.position[0] - SCREENSHOT_ORIGIN[0]) * TREE_SCALE,
      TREE_PADDING + ICON_SIZE / 2 + (skill.position[1] - SCREENSHOT_ORIGIN[1]) * TREE_SCALE
    ];
    const centres = tree.skills.map(centre);
    const width = Math.max(...centres.map(([x]) => x)) + NODE_WIDTH / 2 + TREE_PADDING;
    const height = Math.max(...centres.map(([, y]) => y)) - ICON_SIZE / 2 + NODE_HEIGHT + TREE_PADDING;
    const links = tree.links.map(([parent, child]) => {
      const [x1, y1] = centre(parent), [x2, y2] = centre(child);
      return `<line class="link${build.rank(parent) > 0 ? " active" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join("");
    const nodes = tree.skills.map(skill => nodeHtml(build, skill, centre(skill))).join("");
    // The in-game backdrop, scaled and shifted exactly like the node positions.
    const offset = axis => TREE_PADDING + (axis === 0 ? NODE_WIDTH : ICON_SIZE) / 2 - SCREENSHOT_ORIGIN[axis] * TREE_SCALE;
    const background = {
      image: `url("images/backgrounds/${tree.name.toLowerCase()}.jpg")`,
      size: `${SCREENSHOT_WIDTH * TREE_SCALE}px auto`,
      position: `${offset(0)}px ${offset(1)}px`
    };
    return { width, height, background, html: `<svg width="${width}" height="${height}">${links}</svg>${nodes}` };
  }

  // The label hangs below the icon, so the node is placed by its icon centre.
  function nodeHtml(build, skill, [x, y]) {
    const rank = build.rank(skill);
    const state = rank > 0 ? "learned" : build.isAvailable(skill) ? "available" : "locked";
    const slotted = build.slotOf(skill) >= 0 ? " slotted" : "";
    return `<div class="node ${state}${slotted}" data-skill="${skill.index}" draggable="${rank > 0}" style="left:${x - NODE_WIDTH / 2}px;top:${y - ICON_SIZE / 2}px">`
      + `<div class="node-icon" style="background:${treeColour(skill.tree)}"><img src="${iconPath(skill)}" alt="" draggable="false">`
      + `<span class="rank-badge">${rank}/${MAX_RANK}</span></div>${skill.name}</div>`;
  }

  function mutagenPane() {
    const items = catalog.mutagens.map(mutagen =>
      `<div><div class="mutagen" data-mutagen="${mutagen.id}" draggable="true" style="background:${mutagenColour(mutagen)}"><span>${mutagenLabel(mutagen)}</span></div>`
      + `<div class="mutagen-effect">${mutagenEffect(mutagen, mutagen.bonus)}</div></div>`).join("");
    return { width: PANE_WIDTH, height: null, background: paneBackground("mutagens"), html: `<div class="mutagen-grid">${items}</div>` };
  }

  function mutationPane(build) {
    const { left, top, column, row, radius, height } = MUTATION_GRID;
    const centre = mutation => [left + mutation.grid[0] * column, top + mutation.grid[1] * row];
    const links = catalog.mutations.flatMap(mutation => mutation.requires.map(id => {
      const [x1, y1] = centre(catalog.mutation(id)), [x2, y2] = centre(mutation);
      const active = build.isResearched(id) && build.isResearched(mutation.id);
      const style = active ? ` style="stroke:${mutationColour(mutation)}"` : "";
      return `<line class="mutation-link${active ? " active" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${style}/>`;
    })).join("");
    const nodes = catalog.mutations.map(mutation => {
      const [x, y] = centre(mutation);
      const state = build.isResearched(mutation.id) ? "researched" : build.canResearch(mutation.id) ? "available" : "locked";
      const slotted = build.slottedMutation === mutation.id ? " slotted" : "";
      return `<div class="mutation ${state}${slotted}" data-mutation="${mutation.id}" draggable="${build.canSlotMutation(mutation.id)}" `
        + `style="left:${x - radius}px;top:${y - radius}px;background:${mutationColour(mutation)}">${mutation.name}</div>`;
    }).join("");
    return { width: PANE_WIDTH, height, background: paneBackground("mutations"), html: `<svg width="${PANE_WIDTH}" height="${height}">${links}</svg>${nodes}` };
  }

  // --- Slot board

  function boardHtml(build) {
    const [width, height] = BOARD_SIZE;
    const groups = MUTAGEN_SLOT_CENTRES.map((_, group) => group);
    const brackets = groups.map(group => bracketSvg(build, group)).join("");
    const slots = Array.from({ length: build.slotCount }, (_, index) => slotHtml(build, index)).join("");
    const mutagenSlots = groups.map(group => mutagenSlotHtml(build, group)).join("");
    return `<svg width="${width}" height="${height}">${brackets}</svg>${slots}${mutagenSlots}${mutationSlotHtml(build)}`;
  }

  // The bracket joins a group's three slots to its mutagen slot, in the mutagen's colour once one is placed.
  function bracketSvg(build, group) {
    const right = group % 2 === 1;
    const [first, middle, last] = SLOT_POSITIONS.slice(group * SLOTS_PER_GROUP, (group + 1) * SLOTS_PER_GROUP);
    const edge = first[0] + (right ? SLOT_SIZE : 0), spine = edge + (right ? 18 : -18), half = SLOT_SIZE / 2;
    const vertex = MUTAGEN_SLOT_CENTRES[group][0] + (right ? -1 : 1) * MUTAGEN_SLOT_SIZE / Math.SQRT2;
    const mutagen = catalog.mutagen(build.mutagenAt(group));
    const style = mutagen ? ` style="stroke:${mutagenColour(mutagen)};stroke-width:3"` : "";
    return `<path class="bracket" d="M${edge} ${first[1] + half} H${spine} V${last[1] + half} H${edge} `
      + `M${edge} ${middle[1] + half} H${spine} M${spine} ${middle[1] + half} H${vertex}"${style}/>`;
  }

  function slotHtml(build, index) {
    const [x, y] = SLOT_POSITIONS[index], position = `left:${x}px;top:${y}px`;
    if (!build.isSlotUnlocked(index)) {
      const needed = catalog.extraSlotUnlocks[index - BASE_SLOTS];
      return `<div class="slot locked" data-slot="${index}" style="${position}" title="Unlocks at ${needed} researched mutations">🔒</div>`;
    }
    const accepts = index >= BASE_SLOTS ? acceptsHtml(build) : "";
    const mutagen = index < BASE_SLOTS ? catalog.mutagen(build.mutagenAt(slotGroup(index))) : null;
    const skill = build.slotAt(index);
    if (!skill) {
      const frame = mutagen ? `;border-color:${mutagenColour(mutagen)}` : "";
      return `<div class="slot" data-slot="${index}" style="${position}${frame}">${index + 1}${accepts}</div>`;
    }
    // A skill matching its group's mutagen glows, since it raises the bonus.
    const frame = !mutagen ? ""
      : build.slotMatchesMutagen(index) ? `;border-color:#fff;box-shadow:0 0 0 2px ${mutagenColour(mutagen)},0 0 14px ${mutagenColour(mutagen)}`
      : `;box-shadow:0 0 0 2px ${mutagenColour(mutagen)}`;
    return `<div class="slot filled" data-slot="${index}" data-skill="${skill.index}" data-from="${index}" draggable="true" `
      + `style="${position};background:${treeColour(skill.tree)}${frame}">`
      + `<img src="${iconPath(skill)}" alt="" draggable="false"><span class="slot-name">${skill.name}</span>`
      + `<span class="remove" data-remove="skill" data-from="${index}" title="Unslot">✕</span>`
      + `<span class="rank-badge">${build.rank(skill)}/${MAX_RANK}</span>${accepts}</div>`;
  }

  // Coloured segments show which trees the extra slots take under the slotted mutation.
  function acceptsHtml(build) {
    const trees = build.extraSlotTrees();
    if (trees.length === 0) return "";
    return `<span class="slot-accepts" title="Accepts: ${trees.join(", ")}">`
      + `${trees.map(tree => `<i style="background:${treeColour(tree)}"></i>`).join("")}</span>`;
  }

  function mutagenSlotHtml(build, group) {
    const [cx, cy] = MUTAGEN_SLOT_CENTRES[group], half = MUTAGEN_SLOT_SIZE / 2;
    const position = `left:${cx - half}px;top:${cy - half}px`;
    const bonus = build.mutagenBonus(group);
    if (!bonus) return `<div class="mutagen-slot" data-group="${group}" style="${position}"></div>`;
    const { mutagen, matching, synergy, value } = bonus;
    const details = [plural(matching, `matching ${mutagen.tree} skill`), synergy ? `Synergy ${synergy}` : ""].filter(Boolean).join(", ");
    return `<div class="mutagen-slot filled" data-group="${group}" data-mutagen="${mutagen.id}" data-from="${group}" draggable="true" `
      + `style="${position};background:${mutagenColour(mutagen)}"><span class="mutagen-name">${mutagenLabel(mutagen)}</span>`
      + `<span class="remove" data-remove="mutagen" data-from="${group}" title="Remove">✕</span></div>`
      + `<div class="mutagen-bonus" style="left:${cx - 60}px;top:${cy + MUTAGEN_SLOT_SIZE / Math.SQRT2 + 4}px;color:${mutagenColour(mutagen)}">`
      + `${mutagenEffect(mutagen, value)}<br><span>${details}</span></div>`;
  }

  function mutationSlotHtml(build) {
    const [x, y] = MUTATION_SLOT_POSITION, position = `left:${x}px;top:${y}px`;
    const mutation = catalog.mutation(build.slottedMutation);
    if (!mutation) return `<div class="mutation-slot" style="${position}">Mutation<br>(${build.researchedCount} researched)</div>`;
    return `<div class="mutation-slot filled" data-mutation="${mutation.id}" data-from="0" draggable="true" `
      + `style="${position};background:${mutationColour(mutation)}">${mutation.name}`
      + `<span class="remove" data-remove="mutation" data-from="0" title="Remove">✕</span></div>`;
  }

  // --- Build summary

  function summaryHtml(build) {
    const section = (title, colour, lines) => `<b style="color:${colour}">${title}</b>${lines.join("<br>")}`;
    const marker = slotted => slotted ? "◆ " : "";
    const sections = [];
    for (const tree of catalog.trees) {
      const learned = tree.skills.filter(skill => build.rank(skill) > 0);
      if (learned.length === 0) continue;
      sections.push(section(tree.name, treeColour(tree.name),
        learned.map(skill => `${marker(build.slotOf(skill) >= 0)}${skill.name} ${build.rank(skill)}/${MAX_RANK}`)));
    }
    const bonuses = MUTAGEN_SLOT_CENTRES.map((_, group) => [group, build.mutagenBonus(group)]).filter(([, bonus]) => bonus);
    if (bonuses.length) {
      sections.push(section("Mutagens", "var(--tab-mutagens)", bonuses.map(([group, { mutagen, value }]) =>
        `Slots ${group * SLOTS_PER_GROUP + 1}–${(group + 1) * SLOTS_PER_GROUP}: `
        + `<span style="color:${mutagenColour(mutagen)}">${mutagen.name}</span> → ${mutagenEffect(mutagen, value)}`)));
    }
    const researched = catalog.mutations.filter(mutation => !mutation.innate && build.isResearched(mutation.id));
    if (researched.length) {
      sections.push(section("Mutations", "var(--tab-mutations)",
        researched.map(mutation => `${marker(build.slottedMutation === mutation.id)}${mutation.name}`)));
    }
    return sections.length ? `<div class="summary-title">Build (◆ = slotted)</div>${sections.join("")}` : "";
  }

  // --- Info panel

  function showTip(tabId) {
    const current = tab(tabId);
    byId("info").innerHTML = `<h2>${current.id}</h2><div class="info-meta">${TAB_KINDS[current.kind].tip}</div>`;
  }

  function showSkill(build, skill) {
    const rank = build.rank(skill), slot = build.slotOf(skill);
    const names = skills => skills.length ? skills.map(other => other.name).join(", ") : null;
    byId("info").innerHTML = `<h2>${skill.name}</h2>`
      + `<div class="info-meta">${skill.tree} · Rank ${rank}/${MAX_RANK}${slot >= 0 ? ` · Slot ${slot + 1}` : ""}<br>`
      + `Unlocked by: ${names(skill.requires) ?? "Starting skill"}<br>Unlocks: ${names(skill.unlocks) ?? "none"}</div>`
      + skill.ranks.map((text, i) => `<div class="info-rank${i < rank ? " reached" : ""}"><b>Rank ${i + 1}:</b> ${text}</div>`).join("");
  }

  function showMutation(build, mutation) {
    const requires = mutation.requires.length
      ? ` · Requires: ${mutation.requires.map(id => catalog.mutation(id).name).join(" and ")}` : "";
    const unlockedSlots = catalog.extraSlotUnlocks.filter(needed => build.researchedCount >= needed).length;
    const synapses = mutation.innate ? `<br>Mutations researched: ${build.researchedCount} · Extra slots unlocked: ${unlockedSlots}` : "";
    byId("info").innerHTML = `<h2 style="color:${mutationColour(mutation)}">${mutation.name}</h2>`
      + `<div class="info-meta">${mutation.trees.join(" / ")} mutation · Research cost: ${mutation.cost}${requires}${synapses}</div>`
      + `<div class="info-rank reached">${mutation.description}</div>`;
  }

  function showMutagen(mutagen) {
    byId("info").innerHTML = `<h2>${mutagen.name}</h2><div class="info-meta">${mutagenEffect(mutagen, mutagen.bonus)} per mutagen, `
      + `multiplied by 1 + the number of ${mutagen.tree} skills slotted in the same group. `
      + `Synergy (slotted) adds ${SYNERGY.bonusPerRank * 100}% per rank.</div>`;
  }

  return { tabs, tab, render, showTip, showSkill, showMutation, showMutagen };
}
