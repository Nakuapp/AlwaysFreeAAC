import type { Symbol } from "../data/vocabulary";
import { Delete, Play, Trash2, Volume2 } from "lucide-react";
import { t, type Language } from "../i18n";
import { IconVisual } from "./IconVisual";
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
      <ul
        className="sentence-bar__words"
        role="list"
        aria-label={t(language, "currentSentence")}
        aria-live="polite"
        aria-atomic="false"
      >
        {sentence.length === 0 ? (
          <li className="sentence-bar__placeholder-item">
            <span className="sentence-bar__placeholder">{t(language, "sentencePlaceholder")}</span>
          </li>
        ) : (
          sentence.map((sym, idx) => (
            <li key={`${sym.id}-${idx}`} className="sentence-bar__word-item">
              <button
                className="sentence-bar__word"
                onClick={() => onSpeakWord(sym)}
                aria-label={t(language, "speakWord", { word: sym.speak ?? sym.label })}
                type="button"
              >
                <IconVisual value={sym.emoji} className="sentence-bar__word-icon" />
                <span>{sym.label}</span>
              </button>
            </li>
          ))
        )}
      </ul>

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
              <Volume2 className="sentence-bar__btn-icon" aria-hidden="true" focusable="false" />
              <span>{t(language, "speaking")}</span>
            </>
          ) : (
            <>
              <Play className="sentence-bar__btn-icon" aria-hidden="true" focusable="false" />
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
          <Delete className="sentence-bar__btn-icon" aria-hidden="true" focusable="false" />
          <span className="sr-only">{t(language, "backspace")}</span>
        </button>

        <button
          className="sentence-bar__btn sentence-bar__btn--clear"
          onClick={onClear}
          disabled={sentence.length === 0}
          aria-label={t(language, "clearSentence")}
          type="button"
        >
          <Trash2 className="sentence-bar__btn-icon" aria-hidden="true" focusable="false" />
          <span className="sr-only">{t(language, "clear")}</span>
        </button>
      </div>
    </div>
  );
}
