# Instructions for AI agents

This file is for anyone changing this repository with an AI assistant or agent. What the planner is and
how to run it is in the [README](README.md). This file records what has to be done after a change, and
what is easy to break.

## Commands

```bash
pnpm install          # pnpm only, the version is pinned in package.json
pnpm dev              # http://localhost:5173/witcher3-build-planner/
pnpm check            # typecheck, type-aware ESLint, Prettier and knip
pnpm test             # Vitest, the tests sit next to the code they test
pnpm build            # the static site in dist/, what GitHub Pages serves
```

## How the code is split

Each layer only imports from the layers above it in this list. The model knows nothing about React.

| Folder         | Role                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| `src/data/`    | The game data: skills, tree layout and links, mutagens and mutations. Plain typed values.    |
| `src/catalog/` | Joins the data into lookups (prerequisites, unlocks, ids). Fails fast on a broken reference. |
| `src/build/`   | The `Build` model with every game rule, its snapshot form and the build code.                |
| `src/planner/` | React components and the pure UI logic beside them (colours, geometry, drag and drop).       |
| `src/app/`     | State, the address bar and the page layout: `useBuild`, `useDragAndDrop`, `App`.             |
| `src/main.tsx` | The composition root: builds the catalog, codec and address and renders `App`.               |

## What is easy to break

- **Build codes follow the data and the rules.** A code walks the skills, mutagens and mutations in
  the order of `src/data/`, and each field offers only what `Build` allows at that point. Reordering the
  data, changing a link or changing a rule silently changes what every shared code means. Such a change
  needs a new format behind a marker today's codes cannot contain, such as `3.`, and must keep decoding
  the unmarked codes, the way `W3R1.` codes still decode through `src/build/legacy-build-code.ts`. The pinned codes in `src/build/build-code.test.ts` guard this, never
  change them to make a test pass.
- **The address is the only state.** The build lives in the `build` parameter of the page address
  (`src/app/build-address.ts`), nothing is stored in the browser. A plain address opens an empty build,
  and a 1.x link with the code in its hash is moved into the parameter.
- **Every rule lives in `Build`.** Components call its commands and never decide what is allowed.
  Every command leaves the build valid (`#normalize`), so a new rule goes into `Build` with a test, not
  into a component.
- **React only sees a new build.** `Build` is mutable inside, so a change always goes through
  `apply(draft => ...)` from `useBuild`, which works on a clone. Mutating the build held in state skips
  the render and the address update.
- **The tree links come from the in-game screenshots**, not from the Reddit text, which lists a few
  wrong ones (Razor Focus does not unlock Flood of Anger). `src/catalog/catalog.test.ts` pins examples.
- **Rank texts follow the game.** Rank 1 is the in-game tooltip wording, ranks 2 and 3 put the
  per-rank values into it. The tree bonus of a rank is on its own line after a `\n`, which the info
  panel keeps.
- **Assets are served under the base path.** `public/images/` is referenced at runtime through
  `import.meta.env.BASE_URL` in `src/planner/appearance.ts`, because GitHub Pages serves the site under
  `/witcher3-build-planner/`. The base itself is set once, in `vite.config.ts`. Mutation and mutagen
  icons are named after their ids in `src/data/mutations.ts`, so renaming an id loses its icon.
- **The game version is a claim about the data.** `GAME_VERSION` in `src/data/game-version.ts` names the
  patch the skill data matches, and the header shows it. Raise it only after checking the patch notes.
- **The tree backdrops are aligned to the nodes.** They are the in-game screenshots with the skill
  boxes removed, positioned by `TREE_SCALE` and `SCREENSHOT_ORIGIN` in `src/planner/geometry.ts`.
  Changing the scale moves the nodes and the backdrop together, changing one of them alone does not.

## Before you call a change done

```bash
pnpm check
pnpm test
pnpm build
```

A release raises the version in `package.json` and adds a `CHANGELOG.md` entry, the `/release` skill
walks through it. The page footer shows the version and the deployed commit, so what is live is never a
guess.

## Language and style

- Code, comments and documentation are in English.
- No em dash anywhere, a plain hyphen instead: `git diff | grep -cP '\xe2\x80\x94'` must print 0.
- Named exports only, `type` rather than `interface`, no `utils` or `helpers` modules: a module is
  named after the one concept it holds.
- Tests are named for what, under which condition and what is expected, and follow arrange, act,
  assert.
- Commit messages are one line, at most 70 characters, with no AI attribution.
