import type { Symbol, TileHeight, TileSize } from "../data/vocabulary";
import type { UserBoard } from "../types/userBoard";

const LEGACY_CUSTOM_TILES_KEY = "aac_custom_tiles";
const USER_BOARDS_KEY = "aac_user_boards";

function isValidSymbol(tile: unknown): tile is Record<string, unknown> {
  if (typeof tile !== "object" || tile === null) return false;
  const candidate = tile as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    (typeof candidate.emoji === "string" || typeof candidate.icon === "string")
  );
}

const VALID_TILE_SIZES = new Set<TileSize>(["xs", "sm", "md", "lg", "xl"]);
const VALID_TILE_HEIGHTS = new Set<TileHeight>(["tall", "taller"]);

function parseSymbol(tile: Record<string, unknown>): Symbol {
  return {
    id: tile.id as string,
    label: tile.label as string,
    emoji: (tile.emoji as string) || (tile.icon as string),
    speak: typeof tile.speak === "string" ? tile.speak : undefined,
    color: typeof tile.color === "string" ? tile.color : undefined,
    iconColor: typeof tile.iconColor === "string" ? tile.iconColor : undefined,
    tileSize:
      typeof tile.tileSize === "string" && VALID_TILE_SIZES.has(tile.tileSize as TileSize)
        ? (tile.tileSize as TileSize)
        : undefined,
    tileHeight:
      typeof tile.tileHeight === "string" && VALID_TILE_HEIGHTS.has(tile.tileHeight as TileHeight)
        ? (tile.tileHeight as TileHeight)
        : undefined,
    backgroundImage:
      typeof tile.backgroundImage === "string" && tile.backgroundImage.startsWith("data:image/")
        ? tile.backgroundImage
        : undefined,
    soundFile:
      typeof tile.soundFile === "string" && tile.soundFile.startsWith("data:audio/")
        ? tile.soundFile
        : undefined,
    isCustom: true,
  };
}

/** Default welcome board shown on first launch */
export const DEFAULT_WELCOME_BOARD: UserBoard = {
  id: "welcome",
  label: "Welcome",
  emoji: "star",
  symbols: [
    { id: "welcome-title", label: "Welcome!", emoji: "🎉", color: "yellow", tileSize: "xl", isCustom: true },
    { id: "welcome-hello", label: "Hello", emoji: "👋", color: "yellow", tileSize: "lg", isCustom: true },
    { id: "welcome-i", label: "I", emoji: "👤", color: "blue", tileSize: "sm", isCustom: true },
    { id: "welcome-you", label: "You", emoji: "👉", color: "blue", tileSize: "sm", isCustom: true },
    { id: "welcome-yes", label: "Yes", emoji: "✅", color: "green", tileSize: "sm", isCustom: true },
    { id: "welcome-no", label: "No", emoji: "❌", color: "red", tileSize: "sm", isCustom: true },
    { id: "welcome-please", label: "Please", emoji: "🙏", color: "purple", tileSize: "sm", isCustom: true },
    { id: "welcome-thank-you", label: "Thank You", emoji: "🙌", color: "green", tileSize: "sm", isCustom: true },
    { id: "welcome-help", label: "Help", emoji: "🆘", color: "red", tileSize: "lg", isCustom: true },
    { id: "welcome-more", label: "More", emoji: "➕", color: "orange", tileSize: "sm", isCustom: true },
    { id: "welcome-all-done", label: "All Done", emoji: "🏁", color: "purple", tileSize: "sm", isCustom: true },
    { id: "welcome-happy", label: "Happy", emoji: "😊", color: "yellow", tileSize: "sm", isCustom: true },
    { id: "welcome-want", label: "Want", emoji: "🌟", color: "orange", tileSize: "lg", isCustom: true },
    { id: "welcome-good", label: "Good", emoji: "⭐", color: "green", tileSize: "sm", isCustom: true },
  ],
};

export function loadUserBoards(): UserBoard[] {
  try {
    const raw = localStorage.getItem(USER_BOARDS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((board): board is Record<string, unknown> => {
          if (typeof board !== "object" || board === null) return false;
          const b = board as Record<string, unknown>;
          return (
            typeof b.id === "string" &&
            typeof b.label === "string" &&
            typeof b.emoji === "string" &&
            Array.isArray(b.symbols)
          );
        })
        .map(
          (board): UserBoard => ({
            id: board.id as string,
            label: board.label as string,
            emoji: board.emoji as string,
            symbols: (board.symbols as unknown[])
              .filter(isValidSymbol)
              .map(parseSymbol),
          })
        );
    }
  } catch {
    // ignore
  }

  // Migrate from legacy aac_custom_tiles key
  try {
    const legacy = localStorage.getItem(LEGACY_CUSTOM_TILES_KEY);
    if (legacy) {
      const tiles: unknown = JSON.parse(legacy);
      if (Array.isArray(tiles)) {
        const symbols = tiles.filter(isValidSymbol).map(parseSymbol);
        if (symbols.length > 0) {
          return [
            {
              id: "my-words",
              label: "My Words",
              emoji: "pen-square",
              symbols,
            },
          ];
        }
      }
    }
  } catch {
    // ignore
  }

  return [];
}

export function saveUserBoards(boards: UserBoard[]) {
  try {
    localStorage.setItem(USER_BOARDS_KEY, JSON.stringify(boards));
  } catch {
    // ignore
  }
}
