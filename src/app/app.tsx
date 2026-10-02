import { useMemo, useState, type JSX } from 'react';
import type { BuildCodec } from '../build/build-code';
import type { Catalog } from '../catalog/catalog';
import { GAME_VERSION } from '../data/game-version';
import { treeColour } from '../planner/appearance';
import { BuildSummary } from '../planner/build-summary';
import { InfoPanel, type InfoTarget } from '../planner/info-panel';
import { MutagenPicker } from '../planner/mutagen-picker';
import { MutationTree } from '../planner/mutation-tree';
import { plannerTabs, tabName, type PlannerTab } from '../planner/planner-tab';
import { PlannerTabs } from '../planner/planner-tabs';
import { SharePanel } from '../planner/share-panel';
import { SlotBoard } from '../planner/slot-board';
import { ToxicityPlanner } from '../planner/toxicity-planner';
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
        case 'toxicity':
          draft.resetElixirs();
          return;
      }
    });
  };

  const branchLabel = ((): string => {
    switch (tab.kind) {
      case 'tree':
        return `Points in branch: ${build.treePoints(tab.tree)}`;
      case 'mutations':
        return `Research cost total: ${build.researchCost()}`;
      case 'mutagens':
        return 'Drag to a mutagen slot';
      case 'toxicity':
        return `Toxicity ${build.toxicity()} of ${build.maxToxicity()}`;
    }
  })();

  return (
    <div className="page">
      <header className="masthead">
        <h1>
          <span className="masthead-game">The Witcher 3: Wild Hunt Remastered</span>
          <span className="masthead-app">Build Planner</span>
        </h1>
        <p className="masthead-versions">
          <span>Planner v{RELEASE.version}</span>
          <span title="Skill data from the Remastered release 5.00. Patches 5.00b and 5.00c changed no skills.">
            Game version {GAME_VERSION}
          </span>
        </p>
      </header>
      <main className="planner">
        <PlannerTabs tabs={tabs} current={tab} build={build} onSelect={selectTab} />
        <div className="totals">
          <span>Total Points Allocated: {build.totalPoints()}</span>
          <span>Total Unslotted: {build.unslottedPoints()}</span>
        </div>
        <div className="branch" style={{ color: tabColour(tab) }}>
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
          {tab.kind === 'toxicity' && (
            <ToxicityPlanner
              catalog={catalog}
              build={build}
              onChange={apply}
              onHoverPotion={(potion, tier) => {
                setInfo({ kind: 'potion', potion, tier });
              }}
              onHoverDecoction={(decoction) => {
                setInfo({ kind: 'decoction', decoction });
              }}
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
          boardRef={drag.boardRef}
          onDragStart={drag.start}
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
        <ul className="help">
          <li>
            <b>Click</b> a skill to add a rank or a mutation to research it, <b>right-click</b> to
            take it back.
          </li>
          <li>
            <b>Drag</b> a skill with points, a mutagen or a researched mutation onto the board.
          </li>
          <li>
            <b>Double-click</b> a skill, mutagen or mutation on the board to remove it, or drag it
            off the board.
          </li>
        </ul>
        <BuildSummary build={build} catalog={catalog} />
        <footer className="footer">
          Build planner for The Witcher 3: Wild Hunt Remastered {GAME_VERSION} · by Attila Nyiri ·{' '}
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
