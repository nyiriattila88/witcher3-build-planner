# Witcher 3 Build Planner

A skill planner for **The Witcher 3: Wild Hunt Remastered**: the four reworked skill trees, skill slots, mutagens and mutations, with a build code that restores a whole build.

**Live:** https://nyiriattila88.github.io/witcher3-build-planner/

## Features

- The Combat, Signs, Alchemy and General trees with the in-game layout, links, icons and backdrops, three ranks per skill.
- Twelve skill slots in four groups, each with a mutagen slot whose bonus grows with every matching skill and with Synergy.
- Mutations: research, the slotted mutation, and slots 13-16 that open with research and take only the mutation's colours.
- A build code (and the page URL) that carries the whole build, so it can be shared and loaded back.

## Using it

Open `index.html` in a browser, or use the live page. No installation, no build step and no external requests.

- Left click a skill to add a rank, right click to remove one, drag a skill with points onto a slot.
- Drag a mutagen onto a diamond slot, research mutations with a click and drag one into the centre circle.
- Copy the build code to share a build, paste one into the Load box to open it.

## Project layout

| Path | Contents |
|---|---|
| `index.html` | The page markup |
| `src/data/` | Skills, tree layout and links, mutagens and mutations |
| `src/build.js` | The build model and every game rule |
| `src/build-code.js` | Encoding and decoding of build codes |
| `src/view.js`, `src/app.js` | Rendering, events and drag and drop |
| `images/` | Skill icons, tree backdrops and the favicon |

The version lives in `src/version.js`, the changes in [CHANGELOG.md](CHANGELOG.md).

## Sources

- Skill names and per-rank values: LAMBKING's "Complete Skill Tree Reference" posts on r/witcher.
- Rank 1 tooltip wording: the Fextralife Witcher 3 wiki, checked against Hack the Minotaur's remaster skill tree guide.
- Tree layout, links, icons and backdrops: in-game screenshots published by Mobalytics.
- Mutations, mutagens and the extra slot rules: the rpg-gaming.com Witcher 3 build planner (original game rules).

## Disclaimer

A community fan project, not affiliated with or endorsed by CD PROJEKT RED. The Witcher 3: Wild Hunt and the game's icons and artwork are the property of CD PROJEKT RED.
