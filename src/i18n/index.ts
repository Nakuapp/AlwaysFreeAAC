import type { Category, Symbol } from "../domain";
import { en, enCategoryLabels, enSymbolLabels } from "./locales/en";
import { es, esCategoryLabels, esSymbolLabels } from "./locales/es";
import { fr, frCategoryLabels, frSymbolLabels } from "./locales/fr";
import type { UiStringKey, UiStrings } from "./locales/types";

export type { UiStringKey } from "./locales/types";

export type Language = "en" | "es" | "fr";
export type Theme = "light" | "dark";
export type LayoutOrder = "tabs-top" | "speech-top";

export const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

const UI_STRINGS: Record<Language, UiStrings> = { en, es, fr };

const CATEGORY_LABELS: Record<Language, Record<string, string>> = {
  en: enCategoryLabels,
  es: esCategoryLabels,
  fr: frCategoryLabels,
};

const SYMBOL_LABELS: Record<Language, Record<string, string>> = {
  en: enSymbolLabels,
  es: esSymbolLabels,
  fr: frSymbolLabels,
};

export function t(
  language: Language,
  key: UiStringKey,
  variables?: Record<string, string | number>,
): string {
  const template = UI_STRINGS[language][key] ?? UI_STRINGS.en[key];
  if (!variables) return template;
  return Object.entries(variables).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
    template,
  );
}

export function getCategoryLabel(language: Language, category: Category): string {
  return CATEGORY_LABELS[language][category.id] ?? category.label;
}

export function getSymbolLabel(language: Language, symbol: Symbol): string {
  return SYMBOL_LABELS[language][symbol.id] ?? symbol.label;
}

export function getSymbolSpeak(language: Language, symbol: Symbol): string {
  return SYMBOL_LABELS[language][symbol.id] ?? symbol.speak ?? symbol.label;
}

export function localizeCategories(language: Language, categories: Category[]): Category[] {
  return categories.map((category) => ({
    ...category,
    label: getCategoryLabel(language, category),
    symbols: category.symbols.map((symbol) => ({
      ...symbol,
      label: getSymbolLabel(language, symbol),
      speak: getSymbolSpeak(language, symbol),
    })),
  }));
}
