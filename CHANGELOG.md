# Changelog

## 2.11.1 - 2026-10-04

- Nothing changes in how the planner works: this release tidies the code behind it. The gear and the
  toxicity plan have parts of their own, and the slot board is split into its pieces, with new tests.
- The board ignores a slot or mutagen position it does not have, instead of growing extra empty slots.

## 2.11.0 - 2026-10-03

- The board works from the keyboard: Tab reaches every open slot, Enter or Space opens the list of what
  fits there, and Delete or Backspace takes the skill, mutagen or mutation off.
- Space on a selected mutation researches it without scrolling the page, the way it works on a skill.
- A link whose build code cannot be read now says so in the build code panel and keeps the code in the
  address bar until the build is changed, instead of quietly opening an empty build.
- The build code panel names everything the code holds, the toxicity plan and the gear too.

## 2.10.0 - 2026-10-03

- Hovering a mutation in the mutation tree shows its tooltip beside it, the way a skill shows one in its
  tree: its colours, research cost, what it requires and what it does.
- The runewords and glyphwords of the Gear tab are listed by the Runewright level that offers them, then
  by name.
- Added to a phone's home screen, the planner shows the wolf medallion as its icon instead of a letter,
  and on Android the browser bar takes the page's dark colour.

## 2.9.1 - 2026-10-03

- On a phone a skill name no longer runs into the skill under it where two rows sit close, as at the top
  of the Signs and Alchemy trees. A name may run wider than its skill to stay on one line.

## 2.9.0 - 2026-10-03

- The planner works on a phone. The page turns into one column with the info panel right under the
  pane, the skill trees, the mutation tree and the slot board scale down to the width of the screen with
  larger labels, and the Mutagens, Toxicity and Gear tabs fit their grids to it.
- A click on a slot of the board lists what can go in, the skills that fit, the mutagens or the
  researched mutations, and picking one puts it there, so the board fills without dragging. A slot that
  holds something can be emptied from the same list.
- On a touch screen a double tap takes a skill, mutagen or mutation off the board, as a double click
  does.
- The tooltips that follow the pointer stay hidden on a touch screen, where the info panel shows the
  same text.

## 2.8.0 - 2026-10-03

- The runes, glyphs and runeword or glyphword picked for a slot stay when another item takes it. What the
  new item has no socket for stays greyed out and idle, and counts again once an item with room for it
  is worn. Emptying a slot clears it.
- The sockets sit in the left column and the runeword or glyphword in the right one for every item.
- Every gear name carries its tier in front, so Ursine steel sword - mastercrafted reads Mastercrafted
  Ursine steel sword, like the armor and the grandmaster swords.
- The version buttons are numbered by tier on every tile, V being grandmaster, and a tier a school does
  not make stays greyed out in its place. Manticore gear is grandmaster only, the Viper armor and
  venomous swords count as mastercrafted, the master who makes them.

## 2.7.2 - 2026-10-03

- The armor tiles on the Gear tab show the weight class under the armor number, such as Heavy armor.

## 2.7.1 - 2026-10-03

- An item's tooltip on the Gear tab names what it is first: the armor's weight class, such as Heavy
  armor, or the kind of sword.
- The school tiles show the damage or armor number and its unit on two lines everywhere.

## 2.7.0 - 2026-10-03

- Every version of the school gear can be picked, from basic to grandmaster, with a button per version
  under each school the way the potions have one per tier. Manticore gear and Viper armor come in one
  version, the Viper swords in two.
- Wearing another version of the same item keeps the runes, glyphs and enchantment that still fit, as
  upgrading does in the game. Only the final versions count towards the set bonuses.
- Gear links of 2.6 keep opening the same build.

## 2.6.1 - 2026-10-03

- The Gear tab shows the runeword or glyphword in one column and the sockets it would fill in the other,
  with the socket choices lined up below each other.
- The school buttons name their numbers as damage or armor, and the seven of them always fit the pane.

## 2.6.0 - 2026-10-03

- A Gear tab picks the witcher school gear worn: the final version of Bear, Cat, Griffin, Wolf, Forgotten
  Wolf, Manticore and Viper gear, one item per slot, mixed freely, with its armor, damage and bonuses
  from The Witcher Wiki.
- Swords take runes and armor takes glyphs, socket by socket. A sword or chest armor with 3 sockets can
  take a runeword or glyphword from the Runewright instead, which fills every socket.
- Wearing 3 or 6 pieces of a school shows its set bonuses, with the per-piece values worked out.
- The Total bonuses add up the gear, its runes and glyphs together with the skills and mutagens, per
  stat. The Manticore armor pieces on the Toxicity tab now come from the gear. Codes written before keep
  their own count until armor is picked.

## 2.5.0 - 2026-10-03

- A potion or decoction that would take the active Toxicity above the maximum can no longer be made
  active, as in the game. It is greyed out, and its tooltip says why. Up to the maximum itself is fine.
- When the maximum drops below the active Toxicity later, for example with Acquired Tolerance out of
  its slot, the plan stays as it is and the Toxicity line warns that it is above the maximum.

## 2.4.0 - 2026-10-03

- On a touch screen a double tap takes a skill rank back or unresearches a mutation, the way a
  right-click does with a mouse. A single tap waits a moment before it counts, so the two can be told
  apart, and a double tap no longer zooms the page there. Mouse clicks count at once, as before.

## 2.3.1 - 2026-10-03

- Potion and decoction descriptions carry their values in the text, the way the skills do: Katakan
  decoction increases critical hit chance by 10%, Nightwraith decoction maximum Vitality by 50 per foe
  killed.
- The values are the ones since patch 4.0. A value noted with its pre-4.0 version was dropped before,
  which left Katakan, Leshen and others without a number. Limits from the wiki pages are in too, such as
  up to 25% resistance for Griffin and up to 30% Attack Power for Succubus.
- Swallow and Troll decoction show their Vitality regeneration both outside and during combat.

## 2.3.0 - 2026-10-02

- The build summary opens with the total bonuses: the tree bonus of every slotted skill, added up per
  rank (three Combat skills at rank 3 give Adrenaline Point gain +9%), and the mutagen bonuses per stat.
  Only slotted skills count, as in the game.
- The Toxicity tab shows the share of the maximum in large digits beside the bar. On the bar the
  overdose line ran through it.
- Hovering Acquired Tolerance, Metabolic Control or a skill's threshold mark on the Toxicity tab opens
  the skill's in-game tooltip, and the info panel shows all its ranks.

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
