import { useMemo, useRef, useState, type KeyboardEvent } from "react";
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
  /** All symbols across every board, used for live search suggestions */
  allSymbols?: Symbol[];
  /** Called when the user selects a suggestion to add it to the sentence */
  onSelectSymbol?: (symbol: Symbol) => void;
  /** Called when the user wants to add a typed word as a new board tile */
  onAddToBoard?: (word: string) => void;
}

const MAX_SUGGESTIONS = 8;

export function SentenceBar({
  sentence,
  speaking,
  onSpeak,
  onClear,
  onRemoveLast,
  onSpeakWord,
  language,
  allSymbols,
  onSelectSymbol,
  onAddToBoard,
}: SentenceBarProps) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = inputText.trim();

  const suggestions = useMemo(() => {
    if (!trimmed || !allSymbols) return [];
    const q = trimmed.toLowerCase();
    return allSymbols
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [trimmed, allSymbols]);

  const hasExactMatch = suggestions.some(
    (s) => s.label.toLowerCase() === trimmed.toLowerCase()
  );
  const showAddToBoard = Boolean(trimmed && !hasExactMatch && onAddToBoard);
  const showSuggestions = suggestions.length > 0 || showAddToBoard;

  function selectSuggestion(sym: Symbol) {
    onSelectSymbol?.(sym);
    setInputText("");
    inputRef.current?.focus();
  }

  function handleAddToBoardClick() {
    if (onAddToBoard && trimmed) {
      onAddToBoard(trimmed);
      setInputText("");
    }
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (suggestions.length > 0) {
        selectSuggestion(suggestions[0]);
      } else if (showAddToBoard) {
        handleAddToBoardClick();
      }
    } else if (e.key === "Escape") {
      setInputText("");
    }
  }

  return (
    <div className="sentence-bar" role="region" aria-label={t(language, "sentenceBuilder")}>
      <div className="sentence-bar__left">
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

        <div className="sentence-bar__input-row">
          <input
            ref={inputRef}
            type="text"
            className="sentence-bar__type-input"
            placeholder={t(language, "typeToSearch")}
            aria-label={t(language, "typeToSearch")}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? "sentence-suggestions" : undefined}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
          />
        </div>

        {showSuggestions && (
          <div
            id="sentence-suggestions"
            className="sentence-bar__suggestions"
            role="listbox"
            aria-label={t(language, "suggestions")}
          >
            {suggestions.map((sym) => (
              <button
                key={sym.id}
                type="button"
                role="option"
                aria-selected={false}
                className="sentence-bar__suggestion-item"
                onClick={() => selectSuggestion(sym)}
              >
                <IconVisual value={sym.emoji} className="sentence-bar__suggestion-icon" />
                <span>{sym.label}</span>
              </button>
            ))}
            {showAddToBoard && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="sentence-bar__suggestion-item sentence-bar__suggestion-item--add"
                onClick={handleAddToBoardClick}
              >
                {t(language, "addWordToBoard", { word: trimmed })}
              </button>
            )}
          </div>
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
