import type { JSX } from 'react';
import { MUTAGEN_GROUPS, type Build } from '../build/build';
import { GEAR_SLOTS } from '../data/gear';
import { treeColour } from './appearance';
import { tabKey, tabName, type PlannerTab } from './planner-tab';

type PlannerTabsProps = {
  readonly tabs: readonly PlannerTab[];
  readonly current: PlannerTab;
  readonly build: Build;
  readonly onSelect: (tab: PlannerTab) => void;
};

const tabColour = (tab: PlannerTab): string =>
  tab.kind === 'tree' ? treeColour(tab.tree) : `var(--tab-${tab.kind})`;

// The number under a tab, and what it counts.
const tabCount = (tab: PlannerTab, build: Build): readonly [count: string, meaning: string] => {
  switch (tab.kind) {
    case 'tree':
      return [`${build.treePoints(tab.tree)}`, 'points spent'];
    case 'mutagens':
      return [`${build.mutagenCount}/${MUTAGEN_GROUPS}`, 'mutagens placed'];
    case 'mutations':
      return [`${build.researchedCount}`, 'mutations researched'];
    case 'toxicity':
      return [`${build.toxicity()}/${build.maxToxicity()}`, 'Toxicity of the maximum'];
    case 'gear':
      return [`${build.gearCount}/${GEAR_SLOTS.length}`, 'items worn'];
  }
};

export function PlannerTabs({ tabs, current, build, onSelect }: PlannerTabsProps): JSX.Element {
  return (
    <nav className="tabs" aria-label="Skill trees, mutagens and mutations">
      {tabs.map((tab) => {
        const active = tabKey(tab) === tabKey(current);
        const [count, meaning] = tabCount(tab, build);
        return (
          <button
            key={tabKey(tab)}
            type="button"
            className={active ? 'tab active' : 'tab'}
            style={{ color: tabColour(tab) }}
            title={`${count} ${meaning}`}
            aria-pressed={active}
            onClick={() => {
              onSelect(tab);
            }}
          >
            <span className="tab-name">{tabName(tab)}</span>
            <span className="tab-count">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}
