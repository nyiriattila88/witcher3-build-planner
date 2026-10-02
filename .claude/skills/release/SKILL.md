---
name: release
description: Cut a release of the planner. Raises the version in package.json, records the change in CHANGELOG.md, runs every check and commits. Use when the user asks for a release, a new version or a version bump.
---

# Release the planner

1. **Pick the version.** Read the current one from `package.json` and apply semantic versioning to
   what changed since the last `CHANGELOG.md` entry:
   - **major** when a build code, a saved build or a URL stops working, or the way to run the
     planner changes,
   - **minor** for a new feature or new game data,
   - **patch** for a fix or a text correction.

   State the choice and the reason in one sentence before changing anything.

2. **Raise it** in the `version` field of `package.json`. That is the only place it lives: the footer
   reads it at build time.
3. **Record it** at the top of `CHANGELOG.md` as `## <version> - <yyyy-mm-dd>`, with one bullet per
   change, written for someone who uses the planner, not for someone reading the diff.
4. **Verify** with `pnpm check`, `pnpm test` and `pnpm build`. A failure stops the release.
5. **Commit** with a one-line message of at most 70 characters, `Release <version>`, without any AI
   attribution.
6. **Do not push** without asking. Pushing to `main` deploys to GitHub Pages, and the footer of the
   live page then shows the new version and commit.
