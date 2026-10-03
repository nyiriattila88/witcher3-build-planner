# Witcher 3 Remastered Build Planner

[![Deploy to GitHub Pages](https://github.com/nyiriattila88/witcher3-build-planner/actions/workflows/deploy.yml/badge.svg)](https://github.com/nyiriattila88/witcher3-build-planner/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/github/package-json/v/nyiriattila88/witcher3-build-planner?label=version)](CHANGELOG.md)
[![Last commit](https://img.shields.io/github/last-commit/nyiriattila88/witcher3-build-planner)](https://github.com/nyiriattila88/witcher3-build-planner/commits/main)
[![Live](https://img.shields.io/badge/live-GitHub%20Pages-2ea44f?logo=github)](https://nyiriattila88.github.io/witcher3-build-planner/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6e9f18?logo=vitest&logoColor=white)

A build planner for **The Witcher 3: Wild Hunt Remastered**, game version 5.00c: the four reworked
skill trees, skill slots, mutagens and mutations, and a short build code that carries a whole build.

**[Open the planner](https://nyiriattila88.github.io/witcher3-build-planner/)**

![A Combat build with Bloodbath: the tree, the slotted skills under red mutagens around the mutation, and two of the extra slots](docs/screenshot.png)

## Features

- **The remastered trees as the game draws them.** Combat, Signs, Alchemy and General with the in-game
  layout, links, icons and backdrops, three ranks per skill and the tooltip wording of the game.
- **The unlock rules.** A skill opens once a linked parent has a point. Taking the last point from a
  skill also takes every skill that only it kept unlocked, so a branch unwinds in one go. A right-click
  takes a rank back, and on a touch screen a double tap does.
- **Skill slots and mutagens.** Drag skills into twelve slots in four groups, or click a slot and pick
  from the list of what fits there. A mutagen's bonus grows with every matching skill in its group and
  with Synergy, and the board shows which slots count.
- **Total bonuses.** The build summary adds up what the slotted skills give through their tree, such as
  Adrenaline Point gain for Combat, and what the mutagens give, one line per stat.
- **Mutations.** Research them in order, slot one in the centre, and fill the four extra slots around it, which open with
  research and take only the mutation's colours. Unresearching a mutation also takes the ones that need it.
- **The in-game character screen.** Tooltips with the current and the next level, mutagen orbs in their
  diamonds, mutation emblems and the bonus of each slot group, as the game shows them. A double click
  or a double tap takes a skill, mutagen or mutation off the board.
- **Toxicity planner.** Pick the potions and decoctions that are active together and see them against the
  maximum Toxicity: the base 100, Acquired Tolerance for the recipes you know, Metabolic Control and the
  Manticore armor pieces you wear. The share of the maximum stands beside the bar, the overdose threshold
  and the thresholds of slotted alchemy skills are marked on it, and every skill there opens its tooltip.
  As in the game, a potion or decoction that would take the total above the maximum cannot be made
  active.
- **Witcher gear.** Wear the school gear of Bear, Cat, Griffin, Wolf, Forgotten Wolf, Manticore and
  Viper in any version from basic to grandmaster, one item per slot and mixed freely. Put runes into the
  swords and glyphs into the armor socket by socket, or a runeword or glyphword from the Runewright. They
  stay with the slot when the item changes, and what the new item has no socket for waits, greyed out,
  until it fits again. Wearing 3 or 6 final pieces of a school shows its set bonuses, the Manticore
  pieces raise maximum Toxicity, and every item, rune and glyph counts towards the total bonuses.
- **On a phone too.** The trees and the board scale down to the width of the screen with larger labels,
  the info panel comes right after the pane, and the board's slots are filled by tapping, so nothing
  needs dragging.
- **Shareable builds.** A short build code restores everything: points, slots, mutagens, mutations, the
  toxicity plan and the gear. The page address carries it as `?build=`, so a copied link opens the same
  build, and a plain address starts empty.
- **Always know what is live.** The header shows the planner version and the game version the data
  matches, the footer the commit and the build date.

## Built with

React 19 and TypeScript in strict mode, bundled by Vite, tested with Vitest. ESLint runs type-aware
(typescript-eslint `strictTypeChecked`), formatting is Prettier, unused code is caught by knip, and pnpm
manages the dependencies. Every push to `main` runs the checks and the tests in GitHub Actions and deploys
the site to GitHub Pages.

## How it works

The game rules know nothing about React. Each layer only imports from the ones above it:

| Layer          | What it holds                                                                       |
| -------------- | ----------------------------------------------------------------------------------- |
| `src/data/`    | The game data as typed values: skills and trees, mutagens, mutations, elixirs, gear |
| `src/catalog/` | The data joined into lookups, with prerequisites and unlocks resolved at startup    |
| `src/build/`   | The `Build` model and every rule, and the build code                                |
| `src/planner/` | React components and the pure UI logic beside them                                  |
| `src/app/`     | State, the address bar, drag and drop and the page layout                           |

A `Build` keeps itself valid after every command, so the components never decide what is allowed. The
build code is one mixed-radix number in base64url. It walks the build field by field, and each field
offers only what the rules allow at that point: a rank only for a skill that is available, a slot only the
learned skills it accepts and no earlier slot holds. A build with a few points gets a code of a dozen
characters, one with every skill, slot, mutagen and mutation filled about 50. Every build has exactly one
code, and tests pin codes made by earlier versions, so a shared build keeps opening the same way.

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
- Tree layout, links and backdrops: in-game screenshots published by Mobalytics, which also give the icons
  of the skills that are new in the Remastered. The other skill icons: The Witcher Wiki on Fandom.
- Mutations, mutagens and the extra slot rules: the rpg-gaming.com Witcher 3 build planner.
- Mutation discs: cut from an in-game screenshot on the Improved Mutations page on Nexus Mods. Mutagen
  orbs: The Witcher Wiki on Fandom.
- Potions and decoctions, their Toxicity, durations and effects and the Manticore armor: The Witcher Wiki
  on Fandom, with the values since patch 4.0, and the Fextralife Witcher 3 wiki pages edited after 4.0
  where the two disagree. The effect values are written into the in-game descriptions. The overdose
  threshold at half of the maximum: the list of changes of the next-gen update 4.0. The 167 alchemy
  recipes: what players measured with Acquired Tolerance since 4.0 (148 in the base game, 150 with Hearts
  of Stone).
- Witcher gear, set bonuses, runestones, glyphs and the Runewright's runewords and glyphwords: The
  Witcher Wiki on Fandom, with the regular game's values since patch 4.0. The set bonuses come with the
  final, grandmaster version of a school's gear.
- Game version: the Remastered patch notes on thewitcher.com. Patches 5.00b and 5.00c changed no
  skills.

## License

The code is released under the [MIT License](LICENSE). The Witcher 3: Wild Hunt, its names, icons and
artwork belong to CD PROJEKT RED and are not covered by it. This is a fan project, not affiliated with or
endorsed by CD PROJEKT RED. The Barlow Semi Condensed font is bundled through Fontsource under the SIL Open
Font License 1.1.

## Author

Made by Attila Nyiri, [@nyiriattila88](https://github.com/nyiriattila88).
