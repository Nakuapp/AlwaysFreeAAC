import type { Symbol } from "../data/vocabulary";
import { SymbolButton } from "./SymbolButton";
import "./SymbolGrid.css";

interface SymbolGridProps {
  symbols: Symbol[];
  columns: number;
  onSelect: (symbol: Symbol) => void;
}

export function SymbolGrid({ symbols, columns, onSelect }: SymbolGridProps) {
  return (
    <main
      className="symbol-grid"
      style={{ "--grid-columns": columns } as React.CSSProperties}
      aria-label="Symbol grid"
    >
      {symbols.map((sym) => (
        <SymbolButton key={sym.id} symbol={sym} onClick={onSelect} />
      ))}
    </main>
  );
}
