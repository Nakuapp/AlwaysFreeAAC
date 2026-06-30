import { useRef } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { Check, Download, Pencil, Plus, Upload } from "lucide-react";
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
  /** OBF export/import handlers for My Words */
  onExportBoard?: () => void;
  onImportBoard?: (file: File) => void;
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
  onExportBoard,
  onImportBoard,
}: SymbolGridProps) {
  const showAddControls = onAddWord !== undefined;
  const importInputRef = useRef<HTMLInputElement>(null);

  function handleImportChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onImportBoard) {
      onImportBoard(file);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  return (
    <div className="symbol-grid-container">
      {showAddControls && (
        <div className="symbol-grid-toolbar">
          {onExportBoard && symbols.length > 0 && (
            <button
              type="button"
              className="symbol-grid-toolbar__btn"
              onClick={onExportBoard}
              title={t(language, "exportBoard")}
            >
              <Download className="symbol-grid-toolbar__btn-icon" aria-hidden="true" focusable="false" />
              {t(language, "exportBoard")}
            </button>
          )}
          {onImportBoard && (
            <>
              <button
                type="button"
                className="symbol-grid-toolbar__btn"
                onClick={() => importInputRef.current?.click()}
                title={t(language, "importBoard")}
              >
                <Upload className="symbol-grid-toolbar__btn-icon" aria-hidden="true" focusable="false" />
                {t(language, "importBoard")}
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".obf,application/json"
                className="symbol-grid-toolbar__import-input"
                onChange={handleImportChange}
                aria-hidden="true"
                tabIndex={-1}
              />
            </>
          )}
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
