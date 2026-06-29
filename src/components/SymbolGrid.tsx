import type { CSSProperties } from "react";
import { Check, Pencil, Plus } from "lucide-react";
import type { Symbol } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { SymbolButton } from "./SymbolButton";
import "./SymbolGrid.css";

interface SymbolGridProps {
  symbols: Symbol[];
  columns: number;
  onSelect: (symbol: Symbol) => void;
  language: Language;
  /** When provided, shows an "Add Word" button at the end of the grid */
  onAddWord?: () => void;
  /** When provided, shows delete badges on tiles and calls this on delete */
  onDeleteSymbol?: (symbol: Symbol) => void;
  /** Toggles between normal and edit mode for the custom category */
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
}

export function SymbolGrid({
  symbols,
  columns,
  onSelect,
  language,
  onAddWord,
  onDeleteSymbol,
  isEditMode,
  onToggleEditMode,
}: SymbolGridProps) {
  const showAddControls = onAddWord !== undefined;

  return (
    <div className="symbol-grid-container">
      {showAddControls && (
        <div className="symbol-grid-toolbar">
          {onToggleEditMode && symbols.length > 0 && (
            <button
              type="button"
              className={`symbol-grid-toolbar__btn${isEditMode ? " symbol-grid-toolbar__btn--active" : ""}`}
              onClick={onToggleEditMode}
              aria-pressed={Boolean(isEditMode)}
            >
              {isEditMode ? (
                <Check className="symbol-grid-toolbar__btn-icon" aria-hidden="true" focusable="false" />
              ) : (
                <Pencil className="symbol-grid-toolbar__btn-icon" aria-hidden="true" focusable="false" />
              )}
              {isEditMode ? t(language, "doneTiles") : t(language, "editTiles")}
            </button>
          )}
        </div>
      )}
      <main
        id="main-content"
        className="symbol-grid"
        style={{ "--grid-columns": columns } as CSSProperties}
        aria-label={t(language, "symbolGrid")}
      >
        {symbols.length === 0 && showAddControls && (
          <p className="symbol-grid__empty">{t(language, "noCustomTiles")}</p>
        )}
        {symbols.map((sym) => (
          <SymbolButton
            key={sym.id}
            symbol={sym}
            onClick={onSelect}
            disabled={Boolean(isEditMode)}
            onDelete={isEditMode && onDeleteSymbol ? onDeleteSymbol : undefined}
            deleteAriaLabel={(symbol) => `${t(language, "deleteTile")}: ${symbol.label}`}
          />
        ))}
        {showAddControls && (
          <button
            type="button"
            className="symbol-grid__add-btn"
            onClick={onAddWord}
            aria-label={t(language, "addWord")}
          >
            <Plus className="symbol-grid__add-icon" aria-hidden="true" focusable="false" />
            <span className="symbol-grid__add-label">{t(language, "addWord")}</span>
          </button>
        )}
      </main>
    </div>
  );
}
