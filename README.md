# Witcher 3 Build Planner

[![Deploy to GitHub Pages](https://github.com/nyiriattila88/witcher3-build-planner/actions/workflows/deploy.yml/badge.svg)](https://github.com/nyiriattila88/witcher3-build-planner/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/github/package-json/v/nyiriattila88/witcher3-build-planner?label=version)](CHANGELOG.md)
[![Last commit](https://img.shields.io/github/last-commit/nyiriattila88/witcher3-build-planner)](https://github.com/nyiriattila88/witcher3-build-planner/commits/main)
[![Live](https://img.shields.io/badge/live-GitHub%20Pages-2ea44f?logo=github)](https://nyiriattila88.github.io/witcher3-build-planner/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6e9f18?logo=vitest&logoColor=white)

A skill planner for **The Witcher 3: Wild Hunt Remastered**: the four reworked skill trees, skill slots,
mutagens and mutations, and a build code that carries a whole build.

**[Open the planner](https://nyiriattila88.github.io/witcher3-build-planner/)**

## Features

- **The remastered trees as the game draws them.** Combat, Signs, Alchemy and General with the in-game
  layout, links, icons and backdrops, three ranks per skill and the tooltip wording of the game.
- **The unlock rules.** A skill opens once a linked parent has a point, and a point that keeps another
  skill unlocked cannot be taken back.
- **Skill slots and mutagens.** Drag skills into twelve slots in four groups. A mutagen's bonus grows with
  every matching skill in its group and with Synergy, and the board shows which slots count.
- **Mutations.** Research them in order, slot one in the centre, and fill slots 13-16, which open with
  research and take only the mutation's colours.
- **Shareable builds.** A compact build code, also kept in the page URL, restores everything: points,
  slots, mutagens and mutations. The browser remembers the last build.
- **Always know what is live.** The footer shows the version, the commit and the build date.

## Built with

React 19 and TypeScript in strict mode, bundled by Vite, tested with Vitest. ESLint runs type-aware
(typescript-eslint `strictTypeChecked`), formatting is Prettier, unused code is caught by knip, and pnpm
manages the dependencies. Every push to `main` runs the checks and the tests in GitHub Actions and deploys
the site to GitHub Pages.

## How it works

The game rules know nothing about React. Each layer only imports from the ones above it:

| Layer          | What it holds                                                                     |
| -------------- | --------------------------------------------------------------------------------- |
| `src/data/`    | The game data as typed values: skills, tree layout and links, mutagens, mutations |
| `src/catalog/` | The data joined into lookups, with prerequisites and unlocks resolved at startup  |
| `src/build/`   | The `Build` model and every rule, its saved form, and the build code              |
| `src/planner/` | React components and the pure UI logic beside them                                |
| `src/app/`     | State, persistence, drag and drop and the page layout                             |

A `Build` keeps itself valid after every command, so the components never decide what is allowed. The
build code is a fixed-width base64url string: skill ranks as base-4 digits, then the slots, the mutagens,
a research bitmask and the slotted mutation. Tests pin codes made by earlier versions, so a shared build
keeps opening the same way.

## Development

Requirements: Node 24 and pnpm 10 (Corepack picks the pinned version).

```bash
pnpm install
pnpm dev        # http://localhost:5173/witcher3-build-planner/
pnpm check      # typecheck, lint, formatting, unused code
pnpm test
pnpm build      # the static site in dist/
```

Agent instructions for AI-assisted changes are in [AGENTS.md](AGENTS.md). Changes per version are in the
[CHANGELOG](CHANGELOG.md).

## Sources

- Skill names and per-rank values: LAMBKING's "Complete Skill Tree Reference" posts on r/witcher.
- Tooltip wording: the Fextralife Witcher 3 wiki, checked against Hack the Minotaur's remaster skill tree
  guide.
- Tree layout, links, icons and backdrops: in-game screenshots published by Mobalytics.
- Mutations, mutagens and the extra slot rules: the rpg-gaming.com Witcher 3 build planner.

## License

The code is released under the [MIT License](LICENSE). The Witcher 3: Wild Hunt, its names, icons and
artwork belong to CD PROJEKT RED and are not covered by it. This is a fan project, not affiliated with or
endorsed by CD PROJEKT RED.

## Author

Made by Attila Nyiri, [@nyiriattila88](https://github.com/nyiriattila88).
