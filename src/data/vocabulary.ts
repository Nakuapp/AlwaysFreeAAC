export type TileSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface Symbol {
  id: string;
  label: string;
  /** Icon key, emoji character, or a data: URL for a custom uploaded image */
  emoji: string;
  speak?: string; // override spoken text if different from label
  color?: string; // background color category
  iconColor?: string; // icon fill/stroke color category
  /** Per-tile size override; when absent the global tile size is used */
  tileSize?: TileSize;
  /** When true this tile was created by the user and can be deleted */
  isCustom?: boolean;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  symbols: Symbol[];
}

export const CATEGORIES: Category[] = [];

export const ALL_SYMBOLS: Symbol[] = CATEGORIES.flatMap((c) => c.symbols);
