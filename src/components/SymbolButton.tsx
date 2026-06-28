import type { Symbol } from "../data/vocabulary";
import "./SymbolButton.css";

interface SymbolButtonProps {
  symbol: Symbol;
  onClick: (symbol: Symbol) => void;
  size?: "normal" | "large";
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

export function SymbolButton({ symbol, onClick, size = "normal" }: SymbolButtonProps) {
  const bg = symbol.color ? (COLOR_MAP[symbol.color] ?? "var(--color-default)") : "var(--color-default)";

  return (
    <button
      className={`symbol-btn symbol-btn--${size}`}
      style={{ "--symbol-bg": bg } as React.CSSProperties}
      onClick={() => onClick(symbol)}
      aria-label={symbol.speak ?? symbol.label}
      type="button"
    >
      <span className="symbol-btn__emoji" aria-hidden="true">
        {symbol.emoji}
      </span>
      <span className="symbol-btn__label">{symbol.label}</span>
    </button>
  );
}
