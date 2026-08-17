import type { CSSProperties, DragEvent } from "react";
import { ChevronLeft, ChevronRight, GripVertical, Pencil, X } from "lucide-react";
import type { Symbol } from "../../domain";
import { SymbolVisual } from "../../components/symbol";
import { resolveTileColor, toCssBackgroundImage } from "../../ui/tileStyles";
import "./SymbolButton.css";

interface SymbolButtonProps {
  symbol: Symbol;
  onClick: (symbol: Symbol) => void;
  size?: "normal" | "large";
  disabled?: boolean;
  /** Column span for masonry/variable-size grid layouts */
  colSpan?: number;
  /** Row span for variable-height grid layouts */
  rowSpan?: number;
  /** When provided, renders a delete badge that calls this handler */
  onDelete?: (symbol: Symbol) => void;
  deleteAriaLabel?: (symbol: Symbol) => string;
  /** When provided, clicking the tile calls this instead of onClick (edit mode) */
  onEdit?: (symbol: Symbol) => void;
  editAriaLabel?: (symbol: Symbol) => string;
  /** Drag-and-drop support for edit-mode reordering */
  isDraggable?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  onMoveBackward?: () => void;
  onMoveForward?: () => void;
  moveBackwardAriaLabel?: (symbol: Symbol) => string;
  moveForwardAriaLabel?: (symbol: Symbol) => string;
}

export function SymbolButton({
  symbol,
  onClick,
  size = "normal",
  disabled = false,
  colSpan,
  rowSpan,
  onDelete,
  deleteAriaLabel,
  onEdit,
  editAriaLabel,
  isDraggable,
  isDragOver,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveBackward,
  onMoveForward,
  moveBackwardAriaLabel,
  moveForwardAriaLabel,
}: SymbolButtonProps) {
  const bg = resolveTileColor(symbol.color);

  const wrapperStyle: CSSProperties = {};
  if (colSpan && colSpan > 1) {
    wrapperStyle.gridColumn = `span ${colSpan}`;
  }
  if (rowSpan && rowSpan > 1) {
    wrapperStyle.gridRow = `span ${rowSpan}`;
  }

  const btnStyle: CSSProperties = { "--symbol-bg": bg } as CSSProperties;
  if (symbol.textColor) {
    btnStyle.color = symbol.textColor;
  }
  if (symbol.backgroundImage) {
    btnStyle.backgroundImage = toCssBackgroundImage(symbol.backgroundImage);
    btnStyle.backgroundSize = "cover";
    btnStyle.backgroundPosition = "center";
  }

  return (
    <div
      className={`symbol-btn-wrapper${isDragOver ? " symbol-btn-wrapper--drag-over" : ""}${isDraggable ? " symbol-btn-wrapper--draggable" : ""}`}
      style={wrapperStyle}
      draggable={isDraggable}
      onDragStart={(e) => {
        e.dataTransfer?.setData("text/plain", symbol.id);
        onDragStart?.();
      }}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {isDraggable && (
        <span className="symbol-btn__drag-handle" aria-hidden="true">
          <GripVertical
            className="symbol-btn__drag-handle-icon"
            aria-hidden="true"
            focusable="false"
          />
        </span>
      )}
      <button
        className={`symbol-btn symbol-btn--${size}${onEdit ? " symbol-btn--editable" : ""}${symbol.backgroundImage ? " symbol-btn--has-bg-image" : ""}`}
        style={btnStyle}
        onClick={() => (onEdit ? onEdit(symbol) : onClick(symbol))}
        aria-label={
          onEdit
            ? (editAriaLabel?.(symbol) ?? `Edit ${symbol.label}`)
            : (symbol.speak ?? symbol.label)
        }
        disabled={disabled && !onEdit}
        type="button"
      >
        {symbol.backgroundImage && <span className="symbol-btn__bg-overlay" aria-hidden="true" />}
        {!symbol.hideIcon && <SymbolVisual value={symbol.emoji} className="symbol-btn__icon" />}
        {!symbol.hideLabel && <span className="symbol-btn__label">{symbol.label}</span>}
        {onEdit && (
          <span className="symbol-btn__edit-overlay" aria-hidden="true">
            <Pencil
              className="symbol-btn__edit-overlay-icon"
              aria-hidden="true"
              focusable="false"
            />
          </span>
        )}
      </button>
      {onDelete && (
        <button
          type="button"
          className="symbol-btn__delete"
          onClick={() => onDelete(symbol)}
          aria-label={deleteAriaLabel?.(symbol) ?? `Delete ${symbol.label}`}
        >
          <X className="symbol-btn__delete-icon" aria-hidden="true" focusable="false" />
          <span className="sr-only">{deleteAriaLabel?.(symbol) ?? `Delete ${symbol.label}`}</span>
        </button>
      )}
      {(onMoveBackward || onMoveForward) && (
        <div className="symbol-btn__move-actions">
          {onMoveBackward && (
            <button
              type="button"
              className="symbol-btn__move"
              onClick={onMoveBackward}
              aria-label={moveBackwardAriaLabel?.(symbol) ?? `Move ${symbol.label} left`}
            >
              <ChevronLeft className="symbol-btn__move-icon" aria-hidden="true" focusable="false" />
            </button>
          )}
          {onMoveForward && (
            <button
              type="button"
              className="symbol-btn__move"
              onClick={onMoveForward}
              aria-label={moveForwardAriaLabel?.(symbol) ?? `Move ${symbol.label} right`}
            >
              <ChevronRight
                className="symbol-btn__move-icon"
                aria-hidden="true"
                focusable="false"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
