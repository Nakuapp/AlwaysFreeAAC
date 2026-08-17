export type TileSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Per-tile row span; when absent the tile occupies 1 grid row */
export type TileHeight = "tall" | "taller";

export interface Symbol {
  id: string;
  label: string;
  /** Emoji character, data: URL, or https: URL for a custom image */
  emoji: string;
  speak?: string; // override spoken text if different from label
  color?: string; // background color category
  /** Label/emoji text color; when absent the theme default is used */
  textColor?: string;
  /** When true the label text is not rendered on the tile */
  hideLabel?: boolean;
  /** When true the emoji/image icon is not rendered on the tile */
  hideIcon?: boolean;
  /** Per-tile size override; when absent the global tile size is used */
  tileSize?: TileSize;
  /** Per-tile row span override; when absent the tile spans 1 row */
  tileHeight?: TileHeight;
  /** Background image data URL rendered behind the icon + label */
  backgroundImage?: string;
  /** Audio file data URL; when present plays instead of TTS on tile press */
  soundFile?: string;
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
