# Changelog

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
