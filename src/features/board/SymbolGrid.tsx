import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { Plus } from "lucide-react";
import type { TileSize, Symbol } from "../../domain";
import { TILE_SIZE_COLUMNS, getTileColSpan, getTileRowSpan } from "../../ui";
import { t, type Language } from "../../i18n";
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
}

const GRID_GAP_PX = 8;
const MIN_GRID_COLUMN_WIDTH: Record<TileSize, number> = {
  xs: 72,
  sm: 88,
  md: 104,
  lg: 132,
  xl: 168,
};

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
}: SymbolGridProps) {
  const showAddControls = onAddWord !== undefined;
  const preferredColumns = TILE_SIZE_COLUMNS[tileSize];
  const [gridColumns, setGridColumns] = useState(preferredColumns);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const canDrag = Boolean(isEditMode && onReorderSymbols);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setGridColumns(preferredColumns);
      return;
    }

    const minColumnWidth = MIN_GRID_COLUMN_WIDTH[tileSize];
    const updateColumns = () => {
      const availableWidth = container.clientWidth;
      if (availableWidth <= 0) {
        setGridColumns(preferredColumns);
        return;
      }

      const fittedColumns = Math.max(
        1,
        Math.floor((availableWidth + GRID_GAP_PX) / (minColumnWidth + GRID_GAP_PX)),
      );

      setGridColumns(Math.min(preferredColumns, fittedColumns));
    };

    updateColumns();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateColumns);
    observer.observe(container);
    return () => observer.disconnect();
  }, [preferredColumns, tileSize]);

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
    <div className="symbol-grid-container" ref={containerRef}>
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
          const rowSpan = getTileRowSpan(sym.tileHeight);
          return (
            <SymbolButton
              key={sym.id}
              symbol={sym}
              onClick={onSelect}
              disabled={Boolean(isEditMode) && !onEditSymbol}
              colSpan={colSpan}
              rowSpan={rowSpan}
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
              onMoveBackward={
                isEditMode && onReorderSymbols && index > 0
                  ? () => onReorderSymbols(index, index - 1)
                  : undefined
              }
              onMoveForward={
                isEditMode && onReorderSymbols && index < symbols.length - 1
                  ? () => onReorderSymbols(index, index + 1)
                  : undefined
              }
              moveBackwardAriaLabel={(symbol) => `${t(language, "moveTileUp")}: ${symbol.label}`}
              moveForwardAriaLabel={(symbol) => `${t(language, "moveTileDown")}: ${symbol.label}`}
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
