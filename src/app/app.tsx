import { useMemo, useState, type JSX } from 'react';
import type { BuildCodec } from '../build/build-code';
import type { Catalog } from '../catalog/catalog';
import { treeColour } from '../planner/appearance';
import { buildTitle } from '../planner/build-title';
import { BuildSummary } from '../planner/build-summary';
import { InfoPanel, type InfoTarget } from '../planner/info-panel';
import { MutagenPicker } from '../planner/mutagen-picker';
import { MutationTree } from '../planner/mutation-tree';
import { plannerTabs, tabName, type PlannerTab } from '../planner/planner-tab';
import { PlannerTabs } from '../planner/planner-tabs';
import { SharePanel } from '../planner/share-panel';
import { SlotBoard } from '../planner/slot-board';
import { TreePane } from '../planner/tree-pane';
import type { BuildAddress } from './build-address';
import { RELEASE } from './release';
import { useBuild } from './use-build';
import { useDragAndDrop } from './use-drag-and-drop';

type AppProps = {
  readonly catalog: Catalog;
  readonly codec: BuildCodec;
  readonly address: BuildAddress;
};

const REPOSITORY_URL = 'https://github.com/nyiriattila88/witcher3-build-planner';

const tabColour = (tab: PlannerTab): string =>
  tab.kind === 'tree' ? treeColour(tab.tree) : `var(--tab-${tab.kind})`;

export function App({ catalog, codec, address }: AppProps): JSX.Element {
  const { build, code, link, apply, load, reset } = useBuild(catalog, codec, address);
  const tabs = useMemo(() => plannerTabs(catalog), [catalog]);
  const [tab, setTab] = useState<PlannerTab>(() => tabs[0] ?? { kind: 'mutagens' });
  const [info, setInfo] = useState<InfoTarget>({ kind: 'tab', tab });
  const drag = useDragAndDrop(build, apply);

  const selectTab = (next: PlannerTab): void => {
    setTab(next);
    setInfo({ kind: 'tab', tab: next });
  };

  const resetTab = (): void => {
    apply((draft) => {
      switch (tab.kind) {
        case 'tree':
          draft.resetTree(tab.tree);
          return;
        case 'mutagens':
          draft.resetMutagens();
          return;
        case 'mutations':
          draft.resetMutations();
          return;
      }
    });
  };

  const branchLabel =
    tab.kind === 'tree'
      ? `Points in branch: ${build.treePoints(tab.tree)}`
      : tab.kind === 'mutations'
        ? `Research cost total: ${build.researchCost()}`
        : 'Drag to a mutagen slot';

  return (
    <div className="page">
      <main className="planner">
        <h1>{buildTitle(build, catalog) || tabName(tab)}</h1>
        <PlannerTabs tabs={tabs} current={tab} build={build} onSelect={selectTab} />
        <div className="totals">
          <span>Total Points Allocated: {build.totalPoints()}</span>
          <span>Total Unslotted: {build.unslottedPoints()}</span>
        </div>
        <div className="branch" style={{ background: tabColour(tab) }}>
          <span>{tabName(tab)}</span>
          <span>{branchLabel}</span>
        </div>
        <div className="pane">
          {tab.kind === 'tree' && (
            <TreePane
              tree={catalog.tree(tab.tree)}
              build={build}
              onLearn={(skill) => {
                apply((draft) => {
                  draft.addPoint(skill);
                });
                setInfo({ kind: 'skill', skill });
              }}
              onUnlearn={(skill) => {
                apply((draft) => {
                  draft.removePoint(skill);
                });
                setInfo({ kind: 'skill', skill });
              }}
              onHover={(skill) => {
                setInfo({ kind: 'skill', skill });
              }}
              onDragStart={drag.start}
            />
          )}
          {tab.kind === 'mutagens' && (
            <MutagenPicker
              mutagens={catalog.mutagens}
              onHover={(mutagen) => {
                setInfo({ kind: 'mutagen', mutagen });
              }}
              onDragStart={drag.start}
            />
          )}
          {tab.kind === 'mutations' && (
            <MutationTree
              catalog={catalog}
              build={build}
              onResearch={(mutation) => {
                apply((draft) => {
                  draft.research(mutation.id);
                });
                setInfo({ kind: 'mutation', mutation });
              }}
              onUnresearch={(mutation) => {
                apply((draft) => {
                  draft.unresearch(mutation.id);
                });
                setInfo({ kind: 'mutation', mutation });
              }}
              onHover={(mutation) => {
                setInfo({ kind: 'mutation', mutation });
              }}
              onDragStart={drag.start}
            />
          )}
        </div>
        <div className="buttons">
          <button type="button" onClick={resetTab}>
            Reset {tab.kind === 'tree' ? 'Tree' : tabName(tab)}
          </button>
          <button type="button" onClick={reset}>
            Reset All
          </button>
        </div>
        <SharePanel code={code} link={link} onLoad={load} />
      </main>
      <aside className="side">
        <InfoPanel target={info} build={build} catalog={catalog} />
        <SlotBoard
          catalog={catalog}
          build={build}
          overKey={drag.overKey}
          onDragStart={drag.start}
          onDragOver={drag.over}
          onDragLeave={drag.leave}
          onDrop={drag.drop}
          onRemove={(item) => {
            apply((draft) => {
              if (item.kind === 'skill' && item.from !== null) draft.unslot(item.from);
              else if (item.kind === 'mutagen' && item.from !== null)
                draft.removeMutagen(item.from);
              else if (item.kind === 'mutation') draft.unslotMutation();
            });
          }}
          onHoverSkill={(skill) => {
            setInfo({ kind: 'skill', skill });
          }}
          onHoverMutagen={(mutagen) => {
            setInfo({ kind: 'mutagen', mutagen });
          }}
          onHoverMutation={(mutation) => {
            setInfo({ kind: 'mutation', mutation });
          }}
        />
        <p className="help">
          Skills: left click +1 rank, right click −1 rank, drag a skill with points onto a slot.
          Mutagens: drag a diamond onto a mutagen slot. Mutations: left click researches, right
          click un-researches, drag a researched mutation into the centre circle. Drag anything off
          the board (or click ×) to remove it.
        </p>
        <BuildSummary build={build} catalog={catalog} />
        <footer className="footer">
          Skill planner for The Witcher 3: Wild Hunt Remastered · by Attila Nyiri ·{' '}
          <a href={REPOSITORY_URL}>source on GitHub</a>
          <br />
          <span className="release">
            v{RELEASE.version} · {RELEASE.commit} · {RELEASE.builtAt}
          </span>
        </footer>
      </aside>
    </div>
  );
}
