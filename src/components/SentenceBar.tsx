import { useMemo, useRef, useState, useCallback, type KeyboardEvent } from "react";
import type { Symbol } from "../data/vocabulary";
import { Play, Plus, Trash2, Volume2, X } from "lucide-react";
import { t, type Language } from "../i18n";
import { IconVisual } from "./IconVisual";
import "./SentenceBar.css";

interface SentenceBarProps {
  sentence: Symbol[];
  speaking: boolean;
  onSpeak: () => void;
  onClear: () => void;
  onRemoveLast: () => void;
  onRemoveWord?: (index: number) => void;
  onSpeakWord: (symbol: Symbol) => void;
  language: Language;
  /** All symbols across every board, used for chip matching */
  allSymbols?: Symbol[];
  /** Called when the user selects a symbol chip to add it to the sentence */
  onSelectSymbol?: (symbol: Symbol) => void;
  /** Called when the user wants to add a typed word as a new board tile */
  onAddToBoard?: (word: string) => void;
}

interface InputChip {
  word: string;
  matchedSymbol?: Symbol;
}

function findMatchingSymbol(word: string, allSymbols: Symbol[]): Symbol | undefined {
  const q = word.trim().toLowerCase();
  if (!q) return undefined;
  return allSymbols.find((s) => s.label.toLowerCase() === q);
}

export function SentenceBar({
  sentence,
  speaking,
  onSpeak,
  onClear,
  onRemoveLast,
  onRemoveWord,
  onSpeakWord,
  language,
  allSymbols,
  onSelectSymbol,
  onAddToBoard,
}: SentenceBarProps) {
  const [chips, setChips] = useState<InputChip[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const symbols = useMemo(() => allSymbols ?? [], [allSymbols]);

  /** Commit the current inputValue as a chip (called on Space / Enter) */
  const commitWord = useCallback(
    (word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;
      const matchedSymbol = findMatchingSymbol(trimmed, symbols);
      setChips((prev) => [...prev, { word: trimmed, matchedSymbol }]);
      setInputValue("");
    },
    [symbols],
  );

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === " " || e.key === "Enter") {
      if (inputValue.trim()) {
        e.preventDefault();
        commitWord(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "") {
      // Remove last chip and restore its word to the input
      setChips((prev) => {
        if (prev.length === 0) {
          onRemoveLast();
          return prev;
        }
        const last = prev[prev.length - 1];
        setInputValue(last.word);
        return prev.slice(0, -1);
      });
    } else if (e.key === "Escape") {
      setInputValue("");
      setChips([]);
    }
  }

  function handleInputChange(val: string) {
    // If a space appears in the value, auto-commit the word before the space
    const spaceIdx = val.indexOf(" ");
    if (spaceIdx !== -1) {
      const before = val.slice(0, spaceIdx);
      const after = val.slice(spaceIdx + 1);
      if (before.trim()) {
        commitWord(before);
      }
      setInputValue(after);
    } else {
      setInputValue(val);
    }
  }

  function handleChipClick(chip: InputChip) {
    if (chip.matchedSymbol && onSelectSymbol) {
      onSelectSymbol(chip.matchedSymbol);
      // Remove this chip from the input area
      setChips((prev) => prev.filter((c) => c !== chip));
    }
  }

  function handleChipAddToBoard(chip: InputChip) {
    if (onAddToBoard) {
      onAddToBoard(chip.word);
      setChips((prev) => prev.filter((c) => c !== chip));
    }
  }

  function handleRemoveChip(chip: InputChip) {
    setChips((prev) => prev.filter((c) => c !== chip));
  }

  const hasChips = chips.length > 0;
  const hasInput = inputValue.trim().length > 0;

  return (
    <div className="sentence-bar" role="region" aria-label={t(language, "sentenceBuilder")}>
      <div className="sentence-bar__left">
        {/* Current sentence chips */}
        <ul
          className="sentence-bar__words"
          role="list"
          aria-label={t(language, "currentSentence")}
          aria-live="polite"
          aria-atomic="false"
        >
          {sentence.length === 0 && !hasChips && !hasInput ? (
            <li className="sentence-bar__placeholder-item">
              <span className="sentence-bar__placeholder">
                {t(language, "sentencePlaceholder")}
              </span>
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
                {onRemoveWord && (
                  <button
                    type="button"
                    className="sentence-bar__word-remove"
                    onClick={() => onRemoveWord(idx)}
                    aria-label={`Remove ${sym.label}`}
                  >
                    <X
                      className="sentence-bar__word-remove-icon"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </button>
                )}
              </li>
            ))
          )}
        </ul>

        {/* Chip input area */}
        <div
          className="sentence-bar__chip-input"
          role="group"
          aria-label={t(language, "typeToSearch")}
          onClick={() => inputRef.current?.focus()}
        >
          {chips.map((chip, i) => (
            <span
              key={`chip-${i}-${chip.word}`}
              className={`sentence-bar__chip${chip.matchedSymbol ? " sentence-bar__chip--matched" : " sentence-bar__chip--unmatched"}`}
            >
              {chip.matchedSymbol ? (
                <button
                  type="button"
                  className="sentence-bar__chip-add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChipClick(chip);
                  }}
                  title={t(language, "addToSentence")}
                  aria-label={`${t(language, "addToSentence")}: ${chip.matchedSymbol.label}`}
                >
                  <IconVisual
                    value={chip.matchedSymbol.emoji}
                    className="sentence-bar__chip-icon"
                  />
                  <span className="sentence-bar__chip-label">{chip.word}</span>
                </button>
              ) : (
                <>
                  <span className="sentence-bar__chip-label">{chip.word}</span>
                  {onAddToBoard && (
                    <button
                      type="button"
                      className="sentence-bar__chip-new-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChipAddToBoard(chip);
                      }}
                      title={t(language, "addWordToBoard", { word: chip.word })}
                      aria-label={t(language, "addWordToBoard", { word: chip.word })}
                    >
                      <Plus
                        className="sentence-bar__chip-new-icon"
                        aria-hidden="true"
                        focusable="false"
                      />
                    </button>
                  )}
                </>
              )}
              <button
                type="button"
                className="sentence-bar__chip-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveChip(chip);
                }}
                aria-label={`Remove ${chip.word}`}
              >
                <X
                  className="sentence-bar__chip-remove-icon"
                  aria-hidden="true"
                  focusable="false"
                />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="sentence-bar__type-input"
            placeholder={hasChips ? "" : t(language, "typeToSearch")}
            aria-label={t(language, "typeToSearch")}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
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
