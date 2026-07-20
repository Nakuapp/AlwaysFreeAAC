import type { TileSize } from "../data/vocabulary";
import { columnsToTileSize } from "../tileSize";
import type { Language, LayoutOrder, Theme } from "../i18n";

const STORAGE_KEY = "aac_settings";

export interface AppSettings {
  voiceName: string;
  voicePreset: string;
  rate: number;
  pitch: number;
  volume: number;
  tileSize: TileSize;
  fontSize: number;
  language: Language;
  theme: Theme;
  themeAccent: "blue" | "green" | "purple" | "teal" | "orange";
  layoutOrder: LayoutOrder;
  /** When false, tiles immediately speak/play (soundboard mode) instead of building a sentence */
  sentenceBuilderEnabled: boolean;
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
const VALID_ACCENTS = new Set<AppSettings["themeAccent"]>(["blue", "green", "purple", "teal", "orange"]);

function normalizeVoicePreset(preset: unknown): AppSettings["voicePreset"] {
  if (typeof preset !== "string") return "custom";
  const mapped = LEGACY_VOICE_PRESET_MAP[preset] ?? preset;
  return VALID_VOICE_PRESETS.has(mapped as AppSettings["voicePreset"])
    ? (mapped as AppSettings["voicePreset"])
    : "custom";
}

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
    theme: "light",
    themeAccent: "blue",
    layoutOrder: "tabs-top",
    sentenceBuilderEnabled: true,
  };
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings> & { columns?: number };
      const normalizedPreset = normalizeVoicePreset(parsed.voicePreset);
      const normalizedLanguage =
        typeof parsed.language === "string" && VALID_LANGUAGES.has(parsed.language as Language)
          ? (parsed.language as Language)
          : "en";
      const normalizedTheme =
        typeof parsed.theme === "string" && VALID_THEMES.has(parsed.theme as Theme)
          ? (parsed.theme as Theme)
          : "light";
      const normalizedLayoutOrder =
        typeof parsed.layoutOrder === "string" && VALID_LAYOUT_ORDERS.has(parsed.layoutOrder as LayoutOrder)
          ? (parsed.layoutOrder as LayoutOrder)
          : "tabs-top";

      // Migrate legacy numeric columns → named tileSize
      let normalizedTileSize: TileSize =
        typeof parsed.tileSize === "string" && VALID_TILE_SIZES.has(parsed.tileSize as TileSize)
          ? (parsed.tileSize as TileSize)
          : "md";
      if (normalizedTileSize === "md" && typeof parsed.columns === "number") {
        normalizedTileSize = columnsToTileSize(parsed.columns);
      }

      return {
        ...defaultSettings(),
        ...parsed,
        voicePreset: normalizedPreset,
        language: normalizedLanguage,
        theme: normalizedTheme,
        tileSize: normalizedTileSize,
        layoutOrder: normalizedLayoutOrder,
        themeAccent:
          typeof parsed.themeAccent === "string" && VALID_ACCENTS.has(parsed.themeAccent as AppSettings["themeAccent"])
            ? (parsed.themeAccent as AppSettings["themeAccent"])
            : "blue",
        sentenceBuilderEnabled:
          typeof parsed.sentenceBuilderEnabled === "boolean"
            ? parsed.sentenceBuilderEnabled
            : true,
      };
    }
  } catch {
    // ignore
  }
  return defaultSettings();
}

export function saveSettings(s: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}
