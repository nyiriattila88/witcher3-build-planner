import { useState, type JSX } from 'react';

type SharePanelProps = {
  readonly code: string;
  readonly link: string;
  // Takes a build code or a shared link. Returns false when the text holds no build code.
  readonly onLoad: (text: string) => boolean;
  // The page was opened with a build code that could not be read.
  readonly unreadableAddress: boolean;
};

const INTRO =
  'The code holds the whole build: skill points, slots, mutagens, mutations, the toxicity plan and the gear. The page address carries it too, so a copied link opens the same build.';

const UNREADABLE =
  'The build code in the page address could not be read, so an empty build opened instead.';

export function SharePanel({
  code,
  link,
  onLoad,
  unreadableAddress,
}: SharePanelProps): JSX.Element {
  const [pasted, setPasted] = useState('');
  const [message, setMessage] = useState(unreadableAddress ? UNREADABLE : INTRO);

  const copy = async (text: string, copied: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(copied);
    } catch {
      setMessage('The browser blocked the clipboard: select the code and copy it by hand.');
    }
  };

  const load = (): void => {
    if (onLoad(pasted)) {
      setPasted('');
      setMessage('Build loaded.');
    } else {
      setMessage('Invalid build code.');
    }
  };

  return (
    <section className="share">
      <label htmlFor="build-code">Build code</label>
      <div className="share-row">
        <input
          id="build-code"
          value={code}
          readOnly
          onClick={(event) => {
            event.currentTarget.select();
          }}
        />
        <button
          type="button"
          onClick={() => void copy(code, 'Build code copied to the clipboard.')}
        >
          Copy
        </button>
        <button type="button" onClick={() => void copy(link, 'Link copied to the clipboard.')}>
          Copy link
        </button>
      </div>
      <div className="share-row">
        <input
          aria-label="Paste a build code"
          placeholder="Paste a build code or a shared link here"
          spellCheck={false}
          value={pasted}
          onChange={(event) => {
            setPasted(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') load();
          }}
        />
        <button type="button" onClick={load}>
          Load
        </button>
      </div>
      <p className="share-message" role="status">
        {message}
      </p>
    </section>
  );
}
