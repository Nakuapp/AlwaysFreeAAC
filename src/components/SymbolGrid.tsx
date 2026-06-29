import type { CSSProperties } from "react";
import type { Symbol } from "../data/vocabulary";
import { t, type Language } from "../i18n";
import { SymbolButton } from "./SymbolButton";
import "./SymbolGrid.css";

interface SymbolGridProps {
  symbols: Symbol[];
  columns: number;
  onSelect: (symbol: Symbol) => void;
  language: Language;
}

export function SymbolGrid({ symbols, columns, onSelect, language }: SymbolGridProps) {
  return (
    <main
      className="symbol-grid"
      style={{ "--grid-columns": columns } as CSSProperties}
      aria-label={t(language, "symbolGrid")}
    >
      {symbols.map((sym) => (
        <SymbolButton key={sym.id} symbol={sym} onClick={onSelect} />
      ))}
    </main>
  );
}
