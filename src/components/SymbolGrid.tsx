import { useState, type CSSProperties, type DragEvent } from "react";
import { Check, Pencil, Plus } from "lucide-react";
import type { TileSize, Symbol } from "../data/vocabulary";
import { TILE_SIZE_COLUMNS, getTileColSpan } from "../tileSize";
import { t, type Language } from "../i18n";
import { SymbolButton } from "./SymbolButton";
import "./SymbolGrid.css";

interface SymbolGridProps {
  symbols: Symbol[];
  tileSize: TileSize;
  onSelect: (symbol: Symbol) => void;
  language: Language;
  /** When provided, shows an "Add Word" button at the end of the grid */
  onAddWord?: () => void;
  /** When provided, shows delete badges on tiles and calls this on delete */
  onDeleteSymbol?: (symbol: Symbol) => void;
  /** When provided, tapping a tile in edit mode opens the edit dialog */
  onEditSymbol?: (symbol: Symbol) => void;
  /** When provided, allows drag-and-drop reordering of tiles */
  onReorderSymbols?: (fromIndex: number, toIndex: number) => void;
  /** Toggles between normal and edit mode for the custom category */
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
}

export function SymbolGrid({
  symbols,
  tileSize,
  onSelect,
  language,
  onAddWord,
  onDeleteSymbol,
  onEditSymbol,
  onReorderSymbols,
  isEditMode,
  onToggleEditMode,
}: SymbolGridProps) {
  const showAddControls = onAddWord !== undefined;
  const gridColumns = TILE_SIZE_COLUMNS[tileSize];

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const canDrag = Boolean(isEditMode && onReorderSymbols);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragEnter(index: number) {
    if (dragIndex !== null && index !== dragIndex) {
      setDragOverIndex(index);
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null && index !== dragIndex) {
      setDragOverIndex(index);
    }
  }

  function handleDrop(index: number) {
    if (dragIndex !== null && dragIndex !== index && onReorderSymbols) {
      onReorderSymbols(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

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
        style={{ "--grid-columns": gridColumns } as CSSProperties}
        aria-label={t(language, "symbolGrid")}
      >
        {symbols.length === 0 && showAddControls && (
          <p className="symbol-grid__empty">{t(language, "noCustomTiles")}</p>
        )}
        {symbols.map((sym, index) => {
          const colSpan = getTileColSpan(sym.tileSize, gridColumns);
          return (
            <SymbolButton
              key={sym.id}
              symbol={sym}
              onClick={onSelect}
              disabled={Boolean(isEditMode) && !onEditSymbol}
              colSpan={colSpan}
              onDelete={isEditMode && onDeleteSymbol ? onDeleteSymbol : undefined}
              deleteAriaLabel={(symbol) => `${t(language, "deleteTile")}: ${symbol.label}`}
              onEdit={isEditMode && onEditSymbol ? onEditSymbol : undefined}
              editAriaLabel={(symbol) => `${t(language, "editTile")}: ${symbol.label}`}
              isDraggable={canDrag}
              isDragOver={dragOverIndex === index}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            />
          );
        })}
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
