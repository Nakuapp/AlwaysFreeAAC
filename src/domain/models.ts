import type { Symbol, TileSize } from "../data/vocabulary";
import type { Language, LayoutOrder, Theme } from "../i18n";

export type ThemeAccent = "blue" | "green" | "purple" | "teal" | "orange";

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
  themeAccent: ThemeAccent;
  layoutOrder: LayoutOrder;
  sentenceBuilderEnabled: boolean;
}

export interface UserBoard {
  id: string;
  label: string;
  emoji: string;
  symbols: Symbol[];
}
