import type { CSSProperties, DragEvent } from "react";
import { GripVertical, Pencil, X } from "lucide-react";
import type { Symbol } from "../data/vocabulary";
import { ICON_COLOR_HEX } from "../colors";
import { IconVisual } from "./IconVisual";
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
}

const COLOR_MAP: Record<string, string> = {
  green: "var(--color-green)",
  red: "var(--color-red)",
  blue: "var(--color-blue)",
  orange: "var(--color-orange)",
  yellow: "var(--color-yellow)",
  purple: "var(--color-purple)",
  pink: "var(--color-pink)",
  teal: "var(--color-teal)",
  gray: "var(--color-gray)",
};

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
}: SymbolButtonProps) {
  const bg = symbol.color ? (COLOR_MAP[symbol.color] ?? "var(--color-default)") : "var(--color-default)";
  const iconColor = symbol.iconColor ? (ICON_COLOR_HEX[symbol.iconColor] ?? undefined) : undefined;

  const wrapperStyle: CSSProperties = {};
  if (colSpan && colSpan > 1) {
    wrapperStyle.gridColumn = `span ${colSpan}`;
  }
  if (rowSpan && rowSpan > 1) {
    wrapperStyle.gridRow = `span ${rowSpan}`;
  }

  const btnStyle: CSSProperties = { "--symbol-bg": bg } as CSSProperties;
  if (symbol.backgroundImage) {
    btnStyle.backgroundImage = `url(${JSON.stringify(symbol.backgroundImage)})`;
    btnStyle.backgroundSize = "cover";
    btnStyle.backgroundPosition = "center";
  }

  return (
    <div
      className={`symbol-btn-wrapper${isDragOver ? " symbol-btn-wrapper--drag-over" : ""}${isDraggable ? " symbol-btn-wrapper--draggable" : ""}`}
      style={wrapperStyle}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {isDraggable && (
        <span className="symbol-btn__drag-handle" aria-hidden="true">
          <GripVertical className="symbol-btn__drag-handle-icon" aria-hidden="true" focusable="false" />
        </span>
      )}
      <button
        className={`symbol-btn symbol-btn--${size}${onEdit ? " symbol-btn--editable" : ""}${symbol.backgroundImage ? " symbol-btn--has-bg-image" : ""}`}
        style={btnStyle}
        onClick={() => onEdit ? onEdit(symbol) : onClick(symbol)}
        aria-label={onEdit ? (editAriaLabel?.(symbol) ?? `Edit ${symbol.label}`) : (symbol.speak ?? symbol.label)}
        disabled={disabled && !onEdit}
        type="button"
      >
        {symbol.backgroundImage && <span className="symbol-btn__bg-overlay" aria-hidden="true" />}
        <IconVisual value={symbol.emoji} className="symbol-btn__icon" iconColor={iconColor} />
        <span className="symbol-btn__label">{symbol.label}</span>
        {onEdit && (
          <span className="symbol-btn__edit-overlay" aria-hidden="true">
            <Pencil className="symbol-btn__edit-overlay-icon" aria-hidden="true" focusable="false" />
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
      {onEdit && !onDelete && (
        <span className="sr-only">{editAriaLabel?.(symbol) ?? `Edit ${symbol.label}`}</span>
      )}
    </div>
  );
}
