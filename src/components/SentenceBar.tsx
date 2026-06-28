import type { Symbol } from "../data/vocabulary";
import "./SentenceBar.css";

interface SentenceBarProps {
  sentence: Symbol[];
  speaking: boolean;
  onSpeak: () => void;
  onClear: () => void;
  onRemoveLast: () => void;
  onSpeakWord: (symbol: Symbol) => void;
}

export function SentenceBar({
  sentence,
  speaking,
  onSpeak,
  onClear,
  onRemoveLast,
  onSpeakWord,
}: SentenceBarProps) {
  return (
    <div className="sentence-bar" role="region" aria-label="Sentence builder">
      <div
        className="sentence-bar__words"
        role="list"
        aria-label="Current sentence"
        aria-live="polite"
        aria-atomic="false"
      >
        {sentence.length === 0 ? (
          <span className="sentence-bar__placeholder">
            Tap symbols below to build a sentence…
          </span>
        ) : (
          sentence.map((sym, idx) => (
            <button
              key={`${sym.id}-${idx}`}
              className="sentence-bar__word"
              role="listitem"
              onClick={() => onSpeakWord(sym)}
              aria-label={`Speak: ${sym.speak ?? sym.label}`}
              type="button"
            >
              <span aria-hidden="true">{sym.emoji}</span>
              <span>{sym.label}</span>
            </button>
          ))
        )}
      </div>

      <div className="sentence-bar__controls">
        <button
          className="sentence-bar__btn sentence-bar__btn--speak"
          onClick={onSpeak}
          disabled={sentence.length === 0 || speaking}
          aria-label={speaking ? "Speaking…" : "Speak sentence"}
          type="button"
        >
          {speaking ? (
            <>
              <span aria-hidden="true">🔊</span>
              <span>Speaking…</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">▶️</span>
              <span>Speak</span>
            </>
          )}
        </button>

        <button
          className="sentence-bar__btn sentence-bar__btn--backspace"
          onClick={onRemoveLast}
          disabled={sentence.length === 0}
          aria-label="Remove last word"
          type="button"
        >
          <span aria-hidden="true">⌫</span>
          <span className="sr-only">Backspace</span>
        </button>

        <button
          className="sentence-bar__btn sentence-bar__btn--clear"
          onClick={onClear}
          disabled={sentence.length === 0}
          aria-label="Clear sentence"
          type="button"
        >
          <span aria-hidden="true">🗑️</span>
          <span className="sr-only">Clear</span>
        </button>
      </div>
    </div>
  );
}
