import { useState, type JSX } from 'react';

type SharePanelProps = {
  readonly code: string;
  // Returns false when the text is not a build code.
  readonly onLoad: (text: string) => boolean;
};

const INTRO =
  'The code holds the whole build: skill points, slots, mutagens, researched and slotted mutation. The page URL carries it too.';

export function SharePanel({ code, onLoad }: SharePanelProps): JSX.Element {
  const [pasted, setPasted] = useState('');
  const [message, setMessage] = useState(INTRO);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage('Build code copied to the clipboard.');
    } catch {
      setMessage('The browser blocked the clipboard: select the code and copy it by hand.');
    }
  };

  const load = (): void => {
    // A whole shared link works too: the code is the part after "#".
    if (onLoad(pasted.replace(/^.*#/, ''))) {
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
        <button type="button" onClick={() => void copy()}>
          Copy
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
