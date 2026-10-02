import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import { createBrowserBuildAddress } from './app/build-address';
import { createBuildCodec } from './build/build-code';
import { createGameCatalog } from './catalog/game-catalog';
import '@fontsource/barlow-semi-condensed/400.css';
import '@fontsource/barlow-semi-condensed/600.css';
import './styles.css';

const root = document.getElementById('root');
if (root === null) throw new Error('index.html has no #root element');

const catalog = createGameCatalog();

createRoot(root).render(
  <StrictMode>
    <App
      catalog={catalog}
      codec={createBuildCodec(catalog)}
      address={createBrowserBuildAddress(window)}
    />
  </StrictMode>,
);
