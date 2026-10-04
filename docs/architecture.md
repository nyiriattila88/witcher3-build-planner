# How the planner is built

The planner is a static single-page app: React 19 and TypeScript in strict mode, bundled by Vite and served
by GitHub Pages. There is no backend. The whole build lives in the page address, so a link is all it takes
to share one. This page explains how the code is organised and why. The rules for changing it safely are in
[AGENTS.md](../AGENTS.md), the changes per version in the [CHANGELOG](../CHANGELOG.md).

## Layers

The game rules know nothing about React. Each layer only imports from the layers above it, and ESLint
checks both (`import-x/no-restricted-paths` and `no-restricted-imports` in `eslint.config.js`):

| Layer          | What it holds                                                                             |
| -------------- | ----------------------------------------------------------------------------------------- |
| `src/data/`    | The game data as plain typed values: skills and trees, mutagens, mutations, elixirs, gear |
| `src/catalog/` | The data joined into lookups, with prerequisites and unlocks resolved and checked         |
| `src/build/`   | The `Build` model and the parts it owns, with every game rule, and the build code         |
| `src/planner/` | React components and the pure UI logic beside them: colours, geometry, drag and drop      |
| `src/app/`     | State, the address bar, drag and drop and the page layout                                 |

`src/main.tsx` is the composition root: it creates the catalog, the build codec and the browser address
once and hands them to `App`.

## The catalog fails fast

`src/catalog/catalog.ts` joins the data and checks it on the way: names are unique, every link and
mutation requirement points at something that exists, the versions of a gear item rise in level with one
per tier, every school has its set bonuses, and the skills the rules read by name, such as Synergy,
exist. A broken reference stops the page at startup with a message that names it, instead of turning up
later as a wrong number in a tooltip. Lookups by a checked id always find what they look for, only names
read from outside, such as an old build code, go through the find lookups that may come back empty. `catalog.test.ts` builds the
catalog from the real data and pins examples taken from the in-game screenshots.

## The rules live in `Build`

`Build` (`src/build/build.ts`) is the only place that decides what is allowed: whether a skill can take a
rank, which skills a slot accepts, how a mutagen's bonus grows, when an elixir would take Toxicity over the
maximum, which runes fit which sockets. Components ask it what is allowed and call its commands instead of
deciding that themselves.
Every command ends by normalising the build, so taking the last point from a skill also takes the skills
that only it kept unlocked, and the build is valid after any sequence of commands.

`Build` keeps the skills, slots, mutagens and mutations itself, because their rules reach into each other:
research opens slots, a slotted mutation decides what they take, a mutagen counts the skills around it. It
owns two parts whose rules stay inside them, the gear (`GearLoadout`, `build.gear`) and the toxicity plan
(`ToxicityPlan`, `build.toxicityPlan`), and these take their commands directly. What joins them to the
rest stays in `Build`: the maximum Toxicity grows with slotted skills and Manticore armor, so the plan
checks a new potion or decoction against the maximum the build gives it.

`Build` is mutable inside, which keeps the commands simple. React never sees that: `useBuild` applies a
change to a clone (`apply(draft => ...)`) and stores the clone, so every change is a new object for React
and a new address in the browser.

## The build code

A build is written as one mixed-radix number in base64url (`src/build/build-code.ts`). The encoder walks
the build field by field, and each field offers only the choices the rules allow at that point: a rank
only for a skill that is available, a slot only the learned skills it accepts and no earlier slot holds.
A build with a few points gets a code of about a dozen characters, and every build has exactly one code.

Because the walk follows the data and the rules, changing either changes what existing codes mean. New
fields are only ever appended at the end (the toxicity plan and then the gear came after the skills,
mutagens and mutations), and the data lists only grow at their end. Codes made by earlier versions are
pinned in `build-code.test.ts`, and the oldest format, `W3R1.`, still decodes through
`legacy-build-code.ts`.

## The address is the only state

`src/app/build-address.ts` reads and writes the `build` parameter of the page address. Nothing is stored in
the browser: a plain address opens an empty build, a shared link opens the same build anywhere, and an old
link with the code in its hash is moved into the parameter.

## The in-game look

The trees are laid out from in-game screenshots: a node's position is its place on the screenshot, scaled
by one factor (`src/planner/geometry.ts`), and the backdrops are the same screenshots with the skill boxes
removed, so nodes and backdrop stay aligned. The trees, the mutation tree and the slot board keep this
pixel layout on every screen. On a narrow one `FitToWidth` scales them down instead of laying them out
again, and anything measured on the screen, such as where a drag is over the board, is divided by that
scale before it meets the layout.

## Mouse and touch

A mouse adds a rank with a click and takes it back with a right-click. A touch screen has no right-click,
so there a double tap takes back what a tap gives (`use-touch-taps.ts`). On the board a click opens the
list of what a slot can take and a double click takes the item off, so a click there waits out the
double-click window with a mouse too (`use-board-taps.ts`). The list also lets the board be filled without
dragging, which is how it works on a phone.

## Tests and checks

Vitest runs the tests next to the code they test: the rules of `Build`, the build code with pinned codes
and random round trips, the catalog's data, the address handling and the drag and drop targets.
`pnpm check` runs the type check, type-aware ESLint (typescript-eslint `strictTypeChecked`), Prettier and
knip for unused code.

## Deployment and releases

Every push to `main` and every pull request runs the checks, the tests and the build
(`.github/workflows/ci.yml`). A version goes live through its tag: pushing `v2.10.0` starts
`.github/workflows/release.yml`, which checks that the tag names the version in `package.json` and that
the CHANGELOG has an entry for it, runs the same CI on the tagged commit, deploys the site to GitHub Pages
and then publishes a GitHub release with the version's CHANGELOG section. A release therefore exists only
for what went out, dated when it did, and the page footer names the version, the commit and the build
date of what is live.

## Running it locally

Requirements: Node 24 and pnpm 10 (Corepack picks the pinned version).

```bash
pnpm install
pnpm dev        # http://localhost:5173/witcher3-build-planner/
pnpm check      # typecheck, lint, formatting, unused code
pnpm test
pnpm build      # the static site in dist/
```
