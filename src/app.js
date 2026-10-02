const STORAGE_KEY = "w3r-skill-planner";

const catalog = createCatalog({
  skillTrees: SKILL_TREES,
  treeLayout: TREE_LAYOUT,
  mutagens: MUTAGENS,
  mutations: MUTATIONS,
  extraSlotUnlocks: EXTRA_SLOT_UNLOCKS
});
const codec = createBuildCodec(catalog);
const view = createView(catalog);
const byId = id => document.getElementById(id);

let build = initialBuild();
let currentTab = view.tabs[0].id;
let drag = null;

// A code in the URL wins over the saved build, so a shared link opens exactly that build.
function initialBuild() {
  const snapshot = codec.decode(decodeURIComponent(location.hash.slice(1))) ?? readSavedSnapshot();
  return snapshot ? Build.fromSnapshot(catalog, snapshot) : new Build(catalog);
}

// Saving is a convenience: storage throws in private windows or when site data is blocked,
// and history changes can be refused on file:// pages.
function readSavedSnapshot() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

function persist(code) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(build.toSnapshot())); } catch { }
  try { history.replaceState(null, "", `#${code}`); } catch { }
}

// Applies a change to the build, then saves it and redraws the page.
function update(change = () => {}) {
  change();
  const code = codec.encode(build);
  persist(code);
  view.render(build, currentTab);
  byId("code").value = code;
}

const skillAt = element => catalog.skills[Number(element.dataset.skill)];

function selectTab(id) {
  currentTab = id;
  update();
  view.showTip(id);
}

function learn(skill) {
  update(() => build.addPoint(skill));
  view.showSkill(build, skill);
}

function unlearn(skill) {
  update(() => build.removePoint(skill));
  view.showSkill(build, skill);
}

function research(id) {
  update(() => build.research(id));
  view.showMutation(build, catalog.mutation(id));
}

function unresearch(id) {
  update(() => build.unresearch(id));
  view.showMutation(build, catalog.mutation(id));
}

// What "Reset Tree" clears on each kind of tab.
const RESET_TAB = {
  tree: tab => build.resetTree(tab.id),
  mutagens: () => build.resetMutagens(),
  mutations: () => build.resetMutations()
};

function resetTab() {
  const tab = view.tab(currentTab);
  update(() => RESET_TAB[tab.kind](tab));
}

function resetAll() {
  update(() => { build = new Build(catalog); });
}

// --- Drag and drop

// Everything that can be dragged onto the board: where it may land, what a drop does, and how it leaves the board.
// An item dragged from the board carries its slot or group index in "from", one dragged from a pane carries null.
const DRAGGABLE = {
  skill: {
    target: element => element.closest(".slot"),
    accepts: (item, target) => build.slotAccepts(Number(target.dataset.slot), item.skill),
    drop: (item, target) => build.placeSkill(item.skill, Number(target.dataset.slot)),
    discard: from => build.unslot(from)
  },
  mutagen: {
    target: element => element.closest(".mutagen-slot"),
    accepts: () => true,
    drop: (item, target) => item.from === null
      ? build.placeMutagen(item.id, Number(target.dataset.group))
      : build.moveMutagen(item.from, Number(target.dataset.group)),
    discard: from => build.removeMutagen(from)
  },
  mutation: {
    target: element => element.closest(".mutation-slot"),
    accepts: item => build.canSlotMutation(item.id),
    drop: item => build.slotMutation(item.id),
    discard: () => build.unslotMutation()
  }
};

function dragItem(element) {
  const from = element.dataset.from === undefined ? null : Number(element.dataset.from);
  if (element.dataset.skill !== undefined) return { kind: "skill", skill: skillAt(element), from };
  if (element.dataset.mutagen !== undefined) return { kind: "mutagen", id: element.dataset.mutagen, from };
  if (element.dataset.mutation !== undefined) return { kind: "mutation", id: element.dataset.mutation, from };
  return null;
}

function dropTarget(event) {
  if (!(event.target instanceof Element)) return null;
  const handler = DRAGGABLE[drag.kind], target = handler.target(event.target);
  return target && handler.accepts(drag, target) ? target : null;
}

function highlight(target) {
  for (const element of document.querySelectorAll(".over")) if (element !== target) element.classList.remove("over");
  target?.classList.add("over");
}

document.addEventListener("dragstart", event => {
  const source = event.target instanceof Element ? event.target.closest("[draggable=true]") : null;
  drag = source && dragItem(source);
  if (!drag) return;
  event.dataTransfer.setData("text/plain", drag.kind);
  event.dataTransfer.effectAllowed = "move";
});

document.addEventListener("dragover", event => {
  if (!drag) return;
  const target = dropTarget(event);
  highlight(target);
  // A board item dropped anywhere else leaves the board, so the whole page accepts it.
  if (target || drag.from !== null) event.preventDefault();
});

document.addEventListener("drop", event => {
  if (!drag) return;
  event.preventDefault();
  const item = drag, handler = DRAGGABLE[item.kind], target = dropTarget(event);
  drag = null;
  if (target) update(() => handler.drop(item, target));
  else if (item.from !== null) update(() => handler.discard(item.from));
});

document.addEventListener("dragend", () => {
  drag = null;
  highlight(null);
});

// --- Clicks and hovers

document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const tab = event.target.closest("[data-tab]");
  if (tab) return selectTab(tab.dataset.tab);
  const remove = event.target.closest("[data-remove]");
  if (remove) return update(() => DRAGGABLE[remove.dataset.remove].discard(Number(remove.dataset.from)));
  const node = event.target.closest(".node");
  if (node) return learn(skillAt(node));
  const mutation = event.target.closest(".mutation");
  if (mutation) research(mutation.dataset.mutation);
});

document.addEventListener("contextmenu", event => {
  if (!(event.target instanceof Element)) return;
  const node = event.target.closest(".node"), mutation = event.target.closest(".mutation");
  if (!node && !mutation) return;
  event.preventDefault();
  if (node) unlearn(skillAt(node));
  else unresearch(mutation.dataset.mutation);
});

document.addEventListener("mouseover", event => {
  if (!(event.target instanceof Element)) return;
  const skill = event.target.closest("[data-skill]");
  if (skill) return view.showSkill(build, skillAt(skill));
  const mutation = event.target.closest("[data-mutation]");
  if (mutation) return view.showMutation(build, catalog.mutation(mutation.dataset.mutation));
  const mutagen = event.target.closest("[data-mutagen]");
  if (mutagen) view.showMutagen(catalog.mutagen(mutagen.dataset.mutagen));
});

// --- Buttons and the build code

function say(message) {
  byId("share-message").textContent = message;
}

async function copyCode() {
  const field = byId("code");
  try {
    await navigator.clipboard.writeText(field.value);
  } catch {
    // The Clipboard API can be unavailable on file:// pages, the selection copy still works there.
    field.select();
    document.execCommand("copy");
  }
  say("Build code copied to the clipboard.");
}

function loadCode() {
  const field = byId("paste");
  // A whole shared link works too: the code is the part after "#".
  const snapshot = codec.decode(field.value.replace(/^.*#/, ""));
  if (!snapshot) return say("Invalid build code.");
  update(() => { build = Build.fromSnapshot(catalog, snapshot); });
  field.value = "";
  say("Build loaded.");
}

byId("reset-tab").addEventListener("click", resetTab);
byId("reset-all").addEventListener("click", resetAll);
byId("code").addEventListener("click", event => event.target.select());
byId("copy").addEventListener("click", copyCode);
byId("load").addEventListener("click", loadCode);
byId("paste").addEventListener("keydown", event => { if (event.key === "Enter") loadCode(); });
byId("version").textContent = `v${APP_VERSION}`;

update();
view.showTip(currentTab);
