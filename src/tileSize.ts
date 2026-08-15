import type { TileSize, TileHeight } from "./data/vocabulary";

export const TILE_SIZES: readonly TileSize[] = ["xs", "sm", "md", "lg", "xl"] as const;

/** Number of grid columns when this size is set as the global default */
export const TILE_SIZE_COLUMNS: Record<TileSize, number> = {
  xs: 8,
  sm: 6,
  md: 4,
  lg: 3,
  xl: 2,
};

/**
 * Absolute column spans when a tile has a per-tile size override.
 * Values are capped at the current grid column count at render time
 * to prevent a tile from overflowing its grid row.
 */
export const TILE_SIZE_SPAN: Record<TileSize, number> = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 2,
  xl: 4,
};

/** Row span values for per-tile height overrides. */
export const TILE_HEIGHT_ROW_SPAN: Record<TileHeight, number> = {
  tall: 2,
  taller: 3,
};

export const TILE_HEIGHTS: readonly TileHeight[] = ["tall", "taller"] as const;

/**
 * Returns how many grid columns a tile should span given its per-tile size
 * override and the current grid column count derived from the global tile size.
 *
 * Tiles without an explicit override always span exactly 1 column so they
 * fill the current grid cell width uniformly.
 */
export function getTileColSpan(tileSize: TileSize | undefined, gridColumns: number): number {
  if (!tileSize) return 1;
  return Math.min(TILE_SIZE_SPAN[tileSize], gridColumns);
}

/**
 * Returns how many grid rows a tile should span.
 * Tiles without an explicit height override span exactly 1 row.
 */
export function getTileRowSpan(tileHeight: TileHeight | undefined): number {
  if (!tileHeight) return 1;
  return TILE_HEIGHT_ROW_SPAN[tileHeight];
}

/** Map a legacy numeric column count (2-8) to the nearest named TileSize */
export function columnsToTileSize(cols: number): TileSize {
  if (cols <= 2) return "xl";
  if (cols <= 3) return "lg";
  if (cols <= 4) return "md";
  if (cols <= 6) return "sm";
  return "xs";
}
