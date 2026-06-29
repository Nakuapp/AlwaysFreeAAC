import type { CSSProperties } from "react";
import type { Symbol } from "../data/vocabulary";
import "./SymbolButton.css";

interface SymbolButtonProps {
  symbol: Symbol;
  onClick: (symbol: Symbol) => void;
  size?: "normal" | "large";
  /** When provided, renders a delete badge that calls this handler */
  onDelete?: (symbol: Symbol) => void;
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

function isDataUrl(value: string) {
  return value.startsWith("data:");
}

export function SymbolButton({ symbol, onClick, size = "normal", onDelete }: SymbolButtonProps) {
  const bg = symbol.color ? (COLOR_MAP[symbol.color] ?? "var(--color-default)") : "var(--color-default)";

  return (
    <div className="symbol-btn-wrapper">
      <button
        className={`symbol-btn symbol-btn--${size}`}
        style={{ "--symbol-bg": bg } as CSSProperties}
        onClick={() => onClick(symbol)}
        aria-label={symbol.speak ?? symbol.label}
        type="button"
      >
        <span className="symbol-btn__emoji" aria-hidden="true">
          {isDataUrl(symbol.emoji) ? (
            <img
              className="symbol-btn__img"
              src={symbol.emoji}
              alt=""
              draggable={false}
            />
          ) : (
            symbol.emoji
          )}
        </span>
        <span className="symbol-btn__label">{symbol.label}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          className="symbol-btn__delete"
          onClick={() => onDelete(symbol)}
          aria-label={`Delete ${symbol.label}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
