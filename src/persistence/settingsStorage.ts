import type { TileSize } from "../domain";
import type { AppSettings, ThemeAccent } from "../domain/models";
import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "../domain/operationResult";
import type { Language, LayoutOrder, Theme } from "../i18n";
import { columnsToTileSize } from "../ui";
import { finiteNumberInRange, isRecord } from "../utils/runtimeValidation";
import { runMigrations } from "./migrations";
import { browserStorage, type KeyValueStorage } from "./storage";

const STORAGE_KEY = "aac_settings";
const SETTINGS_VERSION = 1;

export function defaultSettings(): AppSettings {
  return {
    voiceName: "",
    voicePreset: "custom",
    rate: 1,
    pitch: 1,
    volume: 1,
    tileSize: "md",
    fontSize: 14,
    language: "en",
    theme: "dark",
    themeAccent: "blue",
    layoutOrder: "tabs-top",
    sentenceBuilderEnabled: false,
  };
}

const LEGACY_VOICE_PRESET_MAP: Record<string, AppSettings["voicePreset"]> = {
  male: "baritone",
  female: "alto",
  child: "soprano",
  deep: "bass",
};

const VALID_VOICE_PRESETS = new Set<AppSettings["voicePreset"]>([
  "custom",
  "baritone",
  "alto",
  "soprano",
  "bass",
]);
const VALID_LANGUAGES = new Set<Language>(["en", "es", "fr"]);
const VALID_THEMES = new Set<Theme>(["light", "dark"]);
const VALID_TILE_SIZES = new Set<TileSize>(["xs", "sm", "md", "lg", "xl"]);
const VALID_LAYOUT_ORDERS = new Set<LayoutOrder>(["tabs-top", "speech-top"]);
const VALID_ACCENTS = new Set<ThemeAccent>(["blue", "green", "purple", "teal", "orange"]);

function normalizeVoicePreset(preset: unknown): AppSettings["voicePreset"] {
  if (typeof preset !== "string") return "custom";
  const mapped = LEGACY_VOICE_PRESET_MAP[preset] ?? preset;
  return VALID_VOICE_PRESETS.has(mapped) ? mapped : "custom";
}

function normalizeSettings(value: unknown): AppSettings {
  if (!isRecord(value)) return defaultSettings();
  const parsed = value;
  const defaults = defaultSettings();
  const normalizedLanguage =
    typeof parsed.language === "string" && VALID_LANGUAGES.has(parsed.language as Language)
      ? (parsed.language as Language)
      : "en";
  const normalizedTheme =
    typeof parsed.theme === "string" && VALID_THEMES.has(parsed.theme as Theme)
      ? (parsed.theme as Theme)
      : "light";
  const normalizedLayoutOrder =
    typeof parsed.layoutOrder === "string" &&
    VALID_LAYOUT_ORDERS.has(parsed.layoutOrder as LayoutOrder)
      ? (parsed.layoutOrder as LayoutOrder)
      : "tabs-top";

  let normalizedTileSize: TileSize =
    typeof parsed.tileSize === "string" && VALID_TILE_SIZES.has(parsed.tileSize as TileSize)
      ? (parsed.tileSize as TileSize)
      : "md";
  if (normalizedTileSize === "md" && typeof parsed.columns === "number") {
    normalizedTileSize = columnsToTileSize(parsed.columns);
  }

  return {
    voiceName: typeof parsed.voiceName === "string" ? parsed.voiceName : defaults.voiceName,
    voicePreset: normalizeVoicePreset(parsed.voicePreset),
    rate: finiteNumberInRange(parsed.rate, 0.5, 2) ?? defaults.rate,
    pitch: finiteNumberInRange(parsed.pitch, 0.5, 2) ?? defaults.pitch,
    volume: finiteNumberInRange(parsed.volume, 0.2, 1) ?? defaults.volume,
    fontSize: finiteNumberInRange(parsed.fontSize, 12, 24) ?? defaults.fontSize,
    language: normalizedLanguage,
    theme: normalizedTheme,
    tileSize: normalizedTileSize,
    layoutOrder: normalizedLayoutOrder,
    themeAccent:
      typeof parsed.themeAccent === "string" && VALID_ACCENTS.has(parsed.themeAccent as ThemeAccent)
        ? (parsed.themeAccent as ThemeAccent)
        : "blue",
    sentenceBuilderEnabled:
      typeof parsed.sentenceBuilderEnabled === "boolean" ? parsed.sentenceBuilderEnabled : true,
  };
}

export function loadSettings(
  storage: KeyValueStorage = browserStorage,
): OperationResult<AppSettings> {
  const fallback = defaultSettings();
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch (error) {
    return operationFailure(
      new Error("Could not read application settings.", { cause: error }),
      fallback,
    );
  }
  if (raw === null) return operationSuccess(fallback);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return operationFailure(
      new Error("Application settings contain malformed JSON.", { cause: error }),
      fallback,
    );
  }

  const migrated = runMigrations({
    input: parsed,
    currentVersion: SETTINGS_VERSION,
    fallback,
    getVersion: (input) => (isRecord(input) ? input.version : undefined),
    getPayload: (input) => {
      if (!isRecord(input) || !("data" in input)) throw new Error("Settings data is missing.");
      if (!isRecord(input.data)) throw new Error("Settings data must be an object.");
      return input.data;
    },
    adaptLegacy: (input) => {
      if (!isRecord(input)) throw new Error("Legacy settings must be an object.");
      return input;
    },
    migrations: {
      0: normalizeSettings,
    },
  });
  return migrated.ok
    ? operationSuccess(normalizeSettings(migrated.value), migrated.warnings)
    : migrated;
}

export function saveSettings(
  settings: AppSettings,
  storage: KeyValueStorage = browserStorage,
): OperationResult<void> {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: SETTINGS_VERSION, data: settings }));
    return operationSuccess(undefined);
  } catch (error) {
    return operationFailure(
      new Error("Could not save application settings.", { cause: error }),
      undefined,
    );
  }
}
