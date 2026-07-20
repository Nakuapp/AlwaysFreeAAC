import type { Symbol } from "../data/vocabulary";

export interface UserBoard {
  id: string;
  label: string;
  emoji: string;
  symbols: Symbol[];
}
