import { render, screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Build, MAX_RANK } from '../build/build';
import { createBuildCodec } from '../build/build-code';
import type { Skill } from '../catalog/catalog';
import { createGameCatalog } from '../catalog/game-catalog';
import type { TreeName } from '../data/skills';
import { App } from './app';
import type { BuildAddress } from './build-address';

const catalog = createGameCatalog();
const codec = createBuildCodec(catalog);

const skill = (tree: TreeName, name: string): Skill => {
  const found = catalog.findSkill(tree, name);
  if (found === undefined) throw new Error(`Test data names an unknown skill: ${tree}/${name}`);
  return found;
};

const MUSCLE_MEMORY = skill('Combat', 'Muscle Memory');

// The code of the build an empty one becomes after the change.
const codeOf = (change: (build: Build) => void): string => {
  const build = new Build(catalog);
  change(build);
  return codec.encode(build);
};

const ONE_RANK = codeOf((build) => {
  build.addPoint(MUSCLE_MEMORY);
});

type Planner = {
  readonly user: UserEvent;
  // Every build code the planner put into the address bar, null for an empty build.
  readonly shown: readonly (string | null)[];
};

// Opens the planner on an address bar kept in memory, the way the browser opens a page address.
const openPlanner = (code = ''): Planner => {
  const user = userEvent.setup();
  const shown: (string | null)[] = [];
  const address: BuildAddress = {
    code: () => code,
    linkTo: (shared) => `https://planner.test/${shared === null ? '' : `?build=${shared}`}`,
    show: (shared) => {
      shown.push(shared);
    },
  };
  render(<App catalog={catalog} codec={codec} address={address} />);
  return { user, shown };
};

const skillNode = (name: string, rank: number): HTMLElement =>
  screen.getByRole('button', { name: `${name}, rank ${rank} of ${MAX_RANK}` });

const pasteIntoLoad = async (user: UserEvent, text: string): Promise<void> => {
  await user.click(screen.getByRole('textbox', { name: 'Paste a build code' }));
  await user.paste(text);
  await user.click(screen.getByRole('button', { name: 'Load' }));
};

describe('App', () => {
  it('adds a rank on a click and puts the new build into the address', async () => {
    const { user, shown } = openPlanner();

    await user.click(skillNode('Muscle Memory', 0));

    expect(skillNode('Muscle Memory', 1)).toBeInTheDocument();
    expect(shown.at(-1)).toBe(ONE_RANK);
  });

  it('takes a rank back on a right-click', async () => {
    const { user } = openPlanner(ONE_RANK);

    await user.pointer({ keys: '[MouseRight]', target: skillNode('Muscle Memory', 1) });

    expect(skillNode('Muscle Memory', 0)).toBeInTheDocument();
  });

  it('keeps an unreadable code in the address and says it could not be read', () => {
    // Spaces, because nearly every run of base64url letters is the code of some build.
    const { shown } = openPlanner('not a build code');

    expect(screen.getByRole('status')).toHaveTextContent(/could not be read/);
    expect(skillNode('Muscle Memory', 0)).toBeInTheDocument();
    expect(shown).toEqual([]);
  });

  it('puts a skill picked from the list into the empty slot that was clicked', async () => {
    const { user } = openPlanner(ONE_RANK);

    const [slot] = screen.getAllByRole('button', {
      name: 'Empty skill slot, click to pick a skill',
    });
    if (slot === undefined) throw new Error('The board shows no empty skill slot');
    await user.click(slot);
    const list = await screen.findByRole('region', { name: 'Skill slot, top left group' });
    await user.click(within(list).getByRole('button', { name: `Muscle Memory 1/${MAX_RANK}` }));

    expect(screen.getByRole('button', { name: 'Muscle Memory in slot 1' })).toBeInTheDocument();
  });

  it('copies the build code to the clipboard', async () => {
    const { user } = openPlanner(ONE_RANK);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await expect(navigator.clipboard.readText()).resolves.toBe(ONE_RANK);
    expect(screen.getByRole('status')).toHaveTextContent('Build code copied to the clipboard.');
  });

  it('opens the build of a pasted link', async () => {
    const { user, shown } = openPlanner();

    await pasteIntoLoad(user, `https://planner.test/?build=${ONE_RANK}`);

    expect(skillNode('Muscle Memory', 1)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Build loaded.');
    expect(shown.at(-1)).toBe(ONE_RANK);
  });

  it('keeps the build when the pasted text holds no build code', async () => {
    const { user } = openPlanner(ONE_RANK);

    await pasteIntoLoad(user, 'not a build code');

    expect(screen.getByRole('status')).toHaveTextContent('Invalid build code.');
    expect(skillNode('Muscle Memory', 1)).toBeInTheDocument();
  });

  it('empties the build and the address on Reset All', async () => {
    const { user, shown } = openPlanner(ONE_RANK);

    await user.click(screen.getByRole('button', { name: 'Reset All' }));

    expect(skillNode('Muscle Memory', 0)).toBeInTheDocument();
    expect(shown.at(-1)).toBeNull();
  });
});
