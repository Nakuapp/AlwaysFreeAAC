const TILE_COLOR_MAP: Record<string, string> = {
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

export const DEFAULT_TILE_COLOR = "var(--color-default)";

export function resolveTileColor(value: string | undefined): string {
  if (!value) return DEFAULT_TILE_COLOR;
  return value.startsWith("#") || value.startsWith("rgb")
    ? value
    : (TILE_COLOR_MAP[value] ?? DEFAULT_TILE_COLOR);
}

export function toCssBackgroundImage(value: string): string {
  return `url(${JSON.stringify(value)})`;
}
