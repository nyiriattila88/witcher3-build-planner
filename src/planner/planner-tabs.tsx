import type { JSX } from 'react';
import { MUTAGEN_GROUPS, type Build } from '../build/build';
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

const tabCount = (tab: PlannerTab, build: Build): string => {
  switch (tab.kind) {
    case 'tree':
      return `${build.treePoints(tab.tree)} pts`;
    case 'mutagens':
      return `${build.mutagenCount}/${MUTAGEN_GROUPS}`;
    case 'mutations':
      return `${build.researchedCount} researched`;
  }
};

export function PlannerTabs({ tabs, current, build, onSelect }: PlannerTabsProps): JSX.Element {
  return (
    <nav className="tabs" aria-label="Skill trees, mutagens and mutations">
      {tabs.map((tab) => {
        const active = tabKey(tab) === tabKey(current);
        return (
          <button
            key={tabKey(tab)}
            type="button"
            className={active ? 'tab active' : 'tab'}
            style={{ background: tabColour(tab) }}
            aria-pressed={active}
            onClick={() => {
              onSelect(tab);
            }}
          >
            {tabName(tab)}
            <span className="tab-count">{tabCount(tab, build)}</span>
          </button>
        );
      })}
    </nav>
  );
}
