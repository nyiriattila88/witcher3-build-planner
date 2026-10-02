import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import { createBrowserBuildStorage } from './app/build-storage';
import { createBuildCodec } from './build/build-code';
import { createGameCatalog } from './catalog/game-catalog';
import './styles.css';

// The same key as the 1.x planner, so a build saved there opens here.
const STORAGE_KEY = 'w3r-skill-planner';

const root = document.getElementById('root');
if (root === null) throw new Error('index.html has no #root element');

const catalog = createGameCatalog();

createRoot(root).render(
  <StrictMode>
    <App
      catalog={catalog}
      codec={createBuildCodec(catalog)}
      storage={createBrowserBuildStorage(window, STORAGE_KEY)}
    />
  </StrictMode>,
);
