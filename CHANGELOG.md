# Changelog

## 2.2.1 - 2026-10-02

- Acquired Tolerance counts all 167 alchemy recipes of the game, not 149. With every recipe and the skill
  at rank 3 in a slot, the maximum Toxicity is 601.
- Hovering a potion or decoction opens the in-game tooltip with its Toxicity, duration and effects.
- The Toxicity bar shows the share of the maximum, and its colour turns red once the overdose threshold is
  passed. The red never showed before, the board's drop highlight covered it.
- Unresearching a mutation also takes the mutations that need it, the way a skill's last point does.

## 2.2.0 - 2026-10-02

- A Toxicity tab plans the potions and decoctions active at the same time: all 27 decoctions and 16
  potions with their Toxicity, duration and effects in every version.
- The maximum Toxicity counts the base 100, Acquired Tolerance for the known recipes (all 149 by default),
  Metabolic Control and up to four pieces of Manticore armor. The skills count only while they sit in a
  slot, as in the game.
- The bar marks the overdose threshold at half of the maximum, and the thresholds of a slotted Delayed
  Recovery or High Tolerance. The plan is part of the build code, and older codes still open.
- Taking the last point from a skill also takes every skill that only it kept unlocked, so a branch of a
  tree unwinds in one go.
- The build summary names a mutagen's group by its corner instead of slot numbers.

## 2.1.5 - 2026-10-02

- After a release the browser loads the images again. A replaced image no longer shows its old version
  for up to ten minutes, which made the new mutation discs look broken right after 2.1.4.
- Delayed Recovery works from 65% Toxicity at rank 2 and from 60% at rank 3, not from 70% at every rank.

## 2.1.4 - 2026-10-02

- Mutations look as in the game: a disc in the mutation's colour, gold for those of more than one
  colour, with the emblem in a badge below. The discs are cut from an in-game screenshot.
- Skill icons sit in their tiles with the game's margins instead of touching the frame. The original
  skills use the game's icons from The Witcher Wiki, the skills new in the Remastered got the same
  margins.
- No text numbers the extra slots any more, since the board does not number them either.

## 2.1.3 - 2026-10-02

- A slot takes the dragged icon as soon as the icon overlaps it at all, and of two slots the one it
  covers more.
- The dragged image is the bare tile. The hover frame and the glow no longer go into it, since they
  made the image bigger and moved the tile off the pointer.

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
