# Changelog

## 2.1.2 - 2026-10-02

- A drop snaps to the slot the dragged icon covers most, so the icon only has to cover a slot, not the
  pointer reach it. Where the icon covers two slots, the one it covers more wins.
- A mutagen colours only the lines from the slots that match it. The rest of its bracket and the empty
  slots of its group keep their grey.

## 2.1.1 - 2026-10-02

- A mutation's disc sits centred in its ring again, in the tree, in the middle of the board and in the
  info panel.
- A dragged skill or mutation follows the pointer as its icon alone, and a slot takes it from a little
  further away, so it snaps in where it looks dropped.
- A skill without points keeps a white icon on its grey tile, so every icon keeps its contrast.
- Build codes no longer start with "2.", which read like a version. Links with it still open.

## 2.1.0 - 2026-10-02

- The header names The Witcher 3: Wild Hunt Remastered, with the planner version and the game version
  the data matches (5.00c). The build title above the tree is gone.
- Build codes are short: a few points take a dozen characters, a full build about 50 instead of 71.
  Codes and links from 1.x and 2.0 keep opening the same build.
- The build lives in the page address as `?build=`, and nothing is stored in the browser. A plain
  address, Reset All or an empty build leave the address without a code. A Copy link button sits next to
  Copy.
- The slot board follows the in-game character screen: each group has a bar with its mutagen bonus,
  mutagens are orbs in silver diamonds, and the slotted mutation sits in the middle with its name and
  description beside it.
- Skills show their rank as three pips, links take the tree's colour, and a skill without points is a
  dark tile as in the game.
- Hovering a skill in a tree or on the board opens the in-game tooltip with the current and next level,
  and the info panel still lists all three ranks with more room and larger text.
- Mutations show their in-game emblems, with the name under the disc, so long names fit.
- A double click takes a skill, mutagen or mutation off the board, the small remove buttons are gone.
- The mutagen bonus caption reads "3 matching" over "Combat skills" and keeps clear of the bracket.

## 2.0.1 - 2026-10-02

- A two-line skill name in slots 13-16 is no longer cut off by the colour bar.
- The mutagen bonus text no longer crosses the line of its slot group.
- The README shows a screenshot of the planner.

## 2.0.0 - 2026-10-02

- Rebuilt as a React and TypeScript single-page app with Vite, deployed to GitHub Pages by GitHub Actions.
- Build codes and saved builds from 1.x keep working, and tests guard the code format.
- The footer shows the live version, commit and build date.
- The tabs show the tree names only.
- The trees work from the keyboard too: Enter adds a rank, Delete removes one.
- Local use changed: run `pnpm dev`, or use the live page. Opening `index.html` directly no longer works.

## 1.1.1 - 2026-10-02

- The Mutagens and Mutations tabs get backdrops in the trees' style: a purple one with a mutagen diamond, an olive one with a helix.

## 1.1.0 - 2026-10-02

- Skill descriptions use the in-game tooltip wording, with each rank's tree bonus on its own line.
- Rank 1 corrections where two sources agree against the earlier data: Cat School Techniques (fast attack damage 2%, Vitality Gain +1%),
  Pyrotechnics (50 bomb damage) and Delayed Recovery (Toxicity above 70%).
- The four skill trees show the in-game backdrops with their emblems.
- The info panel is taller, so the longest description fits without scrolling.

## 1.0.1 - 2026-10-02

- The credits footer is replaced by a one-line description of the planner and its version.

## 1.0.0 - 2026-10-02

First release.

- The four remastered skill trees (Combat, Signs, Alchemy, General) with the in-game layout, icons and links, three ranks per skill.
- Twelve skill slots with drag and drop, four mutagen slots whose bonus grows with matching skills and with Synergy.
- Mutations: research, the slotted mutation, and slots 13-16 that open with research and take only the mutation's colours.
- A build code and a shareable link that restore the whole build.
- A self-contained folder: open `index.html`, no build step and no external references.
