import type { Symbol } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import "./SentenceBar.css";

interface SentenceBarProps {
  sentence: Symbol[];
  speaking: boolean;
  onSpeak: () => void;
  onClear: () => void;
  onRemoveLast: () => void;
  onSpeakWord: (symbol: Symbol) => void;
  language: Language;
}

export function SentenceBar({
  sentence,
  speaking,
  onSpeak,
  onClear,
  onRemoveLast,
  onSpeakWord,
  language,
}: SentenceBarProps) {
  return (
    <div className="sentence-bar" role="region" aria-label={t(language, "sentenceBuilder")}>
      <div
        className="sentence-bar__words"
        role="list"
        aria-label={t(language, "currentSentence")}
        aria-live="polite"
        aria-atomic="false"
      >
        {sentence.length === 0 ? (
          <span className="sentence-bar__placeholder">{t(language, "sentencePlaceholder")}</span>
        ) : (
          sentence.map((sym, idx) => (
            <button
              key={`${sym.id}-${idx}`}
              className="sentence-bar__word"
              role="listitem"
              onClick={() => onSpeakWord(sym)}
              aria-label={t(language, "speakWord", { word: sym.speak ?? sym.label })}
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
          aria-label={speaking ? t(language, "speaking") : t(language, "speakSentence")}
          type="button"
        >
          {speaking ? (
            <>
              <span aria-hidden="true">🔊</span>
              <span>{t(language, "speaking")}</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">▶️</span>
              <span>{t(language, "speak")}</span>
            </>
          )}
        </button>

        <button
          className="sentence-bar__btn sentence-bar__btn--backspace"
          onClick={onRemoveLast}
          disabled={sentence.length === 0}
          aria-label={t(language, "removeLastWord")}
          type="button"
        >
          <span aria-hidden="true">⌫</span>
          <span className="sr-only">{t(language, "backspace")}</span>
        </button>

        <button
          className="sentence-bar__btn sentence-bar__btn--clear"
          onClick={onClear}
          disabled={sentence.length === 0}
          aria-label={t(language, "clearSentence")}
          type="button"
        >
          <span aria-hidden="true">🗑️</span>
          <span className="sr-only">{t(language, "clear")}</span>
        </button>
      </div>
    </div>
  );
}
