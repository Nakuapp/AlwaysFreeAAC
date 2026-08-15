import type { Symbol, TileHeight, TileSize } from "../domain";
import type { UserBoard } from "../domain/models";
import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "../domain/operationResult";
import { isRecord } from "../utils/runtimeValidation";
import { cleanupUnreferencedMedia, serializeBoardMedia } from "./mediaStorage";
import { runMigrations } from "./migrations";
import { browserStorage, type KeyValueStorage } from "./storage";

const LEGACY_CUSTOM_TILES_KEY = "aac_custom_tiles";
const USER_BOARDS_KEY = "aac_user_boards";
const USER_BOARDS_VERSION = 1;

const VALID_TILE_SIZES = new Set<TileSize>(["xs", "sm", "md", "lg", "xl"]);
const VALID_TILE_HEIGHTS = new Set<TileHeight>(["tall", "taller"]);

function isValidSymbol(tile: unknown): tile is Record<string, unknown> {
  if (typeof tile !== "object" || tile === null) return false;
  const candidate = tile as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    (typeof candidate.emoji === "string" || typeof candidate.icon === "string")
  );
}

function isMediaValue(value: unknown, contentType: "image" | "audio"): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith(`data:${contentType}/`) || value.startsWith("media://"))
  );
}

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
    backgroundImage: isMediaValue(tile.backgroundImage, "image") ? tile.backgroundImage : undefined,
    soundFile: isMediaValue(tile.soundFile, "audio") ? tile.soundFile : undefined,
    isCustom: true,
  };
}

function normalizeBoards(boards: unknown[]): UserBoard[] {
  return boards
    .filter((board): board is Record<string, unknown> => {
      if (!isRecord(board)) return false;
      return (
        typeof board.id === "string" &&
        typeof board.label === "string" &&
        typeof board.emoji === "string" &&
        Array.isArray(board.symbols)
      );
    })
    .map((board) => ({
      id: board.id as string,
      label: board.label as string,
      emoji: board.emoji as string,
      symbols: (board.symbols as unknown[]).filter(isValidSymbol).map(parseSymbol),
    }));
}

export const DEFAULT_WELCOME_BOARD: UserBoard = {
  id: "welcome",
  label: "Welcome",
  emoji: "star",
  symbols: [
    {
      id: "welcome-title",
      label: "Welcome!",
      emoji: "🎉",
      color: "yellow",
      tileSize: "md",
      tileHeight: "taller",
      isCustom: true,
    },
    {
      id: "welcome-hello",
      label: "Hello",
      emoji: "👋",
      color: "yellow",
      tileSize: "lg",
      isCustom: true,
    },
    { id: "welcome-i", label: "I", emoji: "👤", color: "blue", tileSize: "sm", isCustom: true },
    { id: "welcome-you", label: "You", emoji: "👉", color: "blue", tileSize: "sm", isCustom: true },
    {
      id: "welcome-yes",
      label: "Yes",
      emoji: "✅",
      color: "green",
      tileSize: "sm",
      isCustom: true,
    },
    { id: "welcome-no", label: "No", emoji: "❌", color: "red", tileSize: "sm", isCustom: true },
    {
      id: "welcome-please",
      label: "Please",
      emoji: "🙏",
      color: "purple",
      tileSize: "sm",
      isCustom: true,
    },
    {
      id: "welcome-thank-you",
      label: "Thank You",
      emoji: "🙌",
      color: "green",
      tileSize: "lg",
      isCustom: true,
    },
    {
      id: "welcome-help",
      label: "Help",
      emoji: "🆘",
      color: "red",
      tileSize: "md",
      tileHeight: "tall",
      isCustom: true,
    },
    {
      id: "welcome-more",
      label: "More",
      emoji: "➕",
      color: "orange",
      tileSize: "sm",
      tileHeight: "tall",
      isCustom: true,
    },
    {
      id: "welcome-all-done",
      label: "All Done",
      emoji: "🏁",
      color: "purple",
      tileSize: "sm",
      tileHeight: "taller",
      isCustom: true,
    },
    {
      id: "welcome-happy",
      label: "Happy",
      emoji: "😊",
      color: "yellow",
      tileSize: "sm",
      tileHeight: "tall",
      isCustom: true,
    },
    {
      id: "welcome-want",
      label: "Want",
      emoji: "🌟",
      color: "orange",
      tileSize: "lg",
      isCustom: true,
    },
    {
      id: "welcome-good",
      label: "Good",
      emoji: "⭐",
      color: "green",
      tileSize: "sm",
      isCustom: true,
    },
  ],
};

export function loadUserBoards(
  storage: KeyValueStorage = browserStorage,
): OperationResult<UserBoard[]> {
  let raw: string | null;
  try {
    raw = storage.getItem(USER_BOARDS_KEY);
  } catch (error) {
    return operationFailure(new Error("Could not read user boards.", { cause: error }), []);
  }

  if (raw !== null) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return operationFailure(
        new Error("User boards contain malformed JSON.", { cause: error }),
        [],
      );
    }
    const migrated = runMigrations({
      input: parsed,
      currentVersion: USER_BOARDS_VERSION,
      fallback: [] as UserBoard[],
      getVersion: (input) => (isRecord(input) ? input.version : undefined),
      getPayload: (input) => {
        if (!isRecord(input) || !Array.isArray(input.boards)) {
          throw new Error("Board data is missing or invalid.");
        }
        return input.boards;
      },
      adaptLegacy: (input) => {
        if (!Array.isArray(input)) throw new Error("Legacy boards must be an array.");
        return input;
      },
      migrations: {
        0: (payload) => {
          if (!Array.isArray(payload)) throw new Error("Legacy boards must be an array.");
          return normalizeBoards(payload);
        },
      },
    });
    if (!migrated.ok) return migrated;
    if (!Array.isArray(migrated.value)) {
      return operationFailure(new Error("Migrated user boards are invalid."), []);
    }
    return operationSuccess(normalizeBoards(migrated.value), migrated.warnings);
  }

  let legacy: string | null;
  try {
    legacy = storage.getItem(LEGACY_CUSTOM_TILES_KEY);
  } catch (error) {
    return operationFailure(new Error("Could not read legacy custom tiles.", { cause: error }), []);
  }
  if (legacy === null) return operationSuccess([]);

  let tiles: unknown;
  try {
    tiles = JSON.parse(legacy);
  } catch (error) {
    return operationFailure(
      new Error("Legacy custom tiles contain malformed JSON.", { cause: error }),
      [],
    );
  }
  if (!Array.isArray(tiles)) {
    return operationFailure(new Error("Legacy custom tiles are invalid."), []);
  }
  const symbols = tiles.filter(isValidSymbol).map(parseSymbol);
  return operationSuccess(
    symbols.length > 0 ? [{ id: "my-words", label: "My Words", emoji: "pen-square", symbols }] : [],
  );
}

export async function saveUserBoards(
  boards: UserBoard[],
  storage: KeyValueStorage = browserStorage,
): Promise<OperationResult<void>> {
  const mediaResult = await serializeBoardMedia(boards);
  const serializedBoards = mediaResult.ok ? mediaResult.value : mediaResult.fallback;
  const warnings = mediaResult.ok
    ? [...mediaResult.warnings]
    : [...mediaResult.warnings, mediaResult.error];
  try {
    storage.setItem(
      USER_BOARDS_KEY,
      JSON.stringify({ version: USER_BOARDS_VERSION, boards: serializedBoards }),
    );
  } catch (error) {
    return operationFailure(
      new Error("Could not save user board metadata.", { cause: error }),
      undefined,
      warnings,
    );
  }

  try {
    await cleanupUnreferencedMedia(serializedBoards);
  } catch (error) {
    warnings.push(
      new Error("User boards were saved, but stale media could not be cleaned up.", {
        cause: error,
      }),
    );
  }
  return operationSuccess(undefined, warnings);
}
