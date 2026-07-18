import type { CSSProperties } from "react";
import { Pencil, X } from "lucide-react";
import type { Symbol } from "../data/vocabulary";
import { IconVisual } from "./IconVisual";
import "./SymbolButton.css";

interface SymbolButtonProps {
  symbol: Symbol;
  onClick: (symbol: Symbol) => void;
  size?: "normal" | "large";
  disabled?: boolean;
  /** When provided, renders a delete badge that calls this handler */
  onDelete?: (symbol: Symbol) => void;
  deleteAriaLabel?: (symbol: Symbol) => string;
  /** When provided, clicking the tile calls this instead of onClick (edit mode) */
  onEdit?: (symbol: Symbol) => void;
  editAriaLabel?: (symbol: Symbol) => string;
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

const ICON_COLOR_MAP: Record<string, string> = {
  red: "#e53935",
  orange: "#f57c00",
  yellow: "#f9a825",
  green: "#2e7d32",
  blue: "#1565c0",
  purple: "#6a1b9a",
  pink: "#ad1457",
  teal: "#00695c",
  gray: "#546e7a",
};

export function SymbolButton({
  symbol,
  onClick,
  size = "normal",
  disabled = false,
  onDelete,
  deleteAriaLabel,
  onEdit,
  editAriaLabel,
}: SymbolButtonProps) {
  const bg = symbol.color ? (COLOR_MAP[symbol.color] ?? "var(--color-default)") : "var(--color-default)";
  const iconColor = symbol.iconColor ? (ICON_COLOR_MAP[symbol.iconColor] ?? undefined) : undefined;

  return (
    <div className="symbol-btn-wrapper">
      <button
        className={`symbol-btn symbol-btn--${size}${onEdit ? " symbol-btn--editable" : ""}`}
        style={{ "--symbol-bg": bg } as CSSProperties}
        onClick={() => onEdit ? onEdit(symbol) : onClick(symbol)}
        aria-label={onEdit ? (editAriaLabel?.(symbol) ?? `Edit ${symbol.label}`) : (symbol.speak ?? symbol.label)}
        disabled={disabled && !onEdit}
        type="button"
      >
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
