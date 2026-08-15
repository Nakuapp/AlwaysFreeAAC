import type { VoiceOption } from "../speech";

export interface VoiceListOption extends VoiceOption {
  displayLabel: string;
  groupLabel: string;
  searchText: string;
}

const FRIENDLY_VOICE_TOKEN_LABELS: Record<string, string> = {
  neural: "Neural",
  neural2: "Neural 2",
  standard: "Standard",
  studio: "Studio",
  wavenet: "WaveNet",
  news: "News",
  journey: "Journey",
  premium: "Premium",
  natural: "Natural",
  compact: "Compact",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatLocaleLabel(locale: string, displayLocale: string): string {
  if (!locale) return "Voice";

  try {
    const canonical = Intl.getCanonicalLocales(locale)[0];
    const displayNames = new Intl.DisplayNames([displayLocale], { type: "language" });
    return displayNames.of(canonical) ?? canonical;
  } catch {
    return locale.replace(/-/g, " ");
  }
}

function humanizeVoiceToken(token: string): string {
  const normalized = token.trim().toLowerCase();
  if (!normalized) return "";
  if (FRIENDLY_VOICE_TOKEN_LABELS[normalized]) return FRIENDLY_VOICE_TOKEN_LABELS[normalized];

  return token
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function extractVoiceDescriptor(voice: VoiceOption): string | null {
  for (const candidate of [voice.name, voice.id]) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;

    const looksTechnical =
      /^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8}){2,}$/i.test(trimmed) ||
      (!/\s/.test(trimmed) &&
        /\b(?:neural|wavenet|standard|studio|journey|news|premium|compact)\b/i.test(trimmed));
    if (!looksTechnical) continue;

    const withoutLocalePrefix = voice.lang
      ? trimmed.replace(new RegExp(`^${escapeRegExp(voice.lang)}[-_]?`, "i"), "")
      : trimmed;
    const descriptor = withoutLocalePrefix.replace(
      /^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8}){1,2}[-_]?/i,
      "",
    );
    const label = descriptor
      .split(/[-_]+/)
      .map(humanizeVoiceToken)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (label) return label;
  }

  return null;
}

function formatVoiceLabel(voice: VoiceOption, displayLocale: string): string {
  const localeLabel = formatLocaleLabel(voice.lang, displayLocale);
  const technicalDescriptor = extractVoiceDescriptor(voice);
  if (technicalDescriptor) return `${localeLabel} — ${technicalDescriptor}`;

  const trimmedName = voice.name.trim();
  if (!trimmedName) return localeLabel;
  if (trimmedName.toLocaleLowerCase().includes(localeLabel.toLocaleLowerCase())) return trimmedName;
  return `${localeLabel} — ${trimmedName}`;
}

export function buildVoiceOptions(voices: VoiceOption[], displayLocale: string): VoiceListOption[] {
  return voices
    .map((voice) => {
      const groupLabel = formatLocaleLabel(voice.lang, displayLocale);
      const displayLabel = formatVoiceLabel(voice, displayLocale);
      return {
        ...voice,
        displayLabel,
        groupLabel,
        searchText: [displayLabel, groupLabel, voice.name, voice.id, voice.lang, voice.engine]
          .join(" ")
          .toLocaleLowerCase(),
      };
    })
    .sort(
      (first, second) =>
        first.groupLabel.localeCompare(second.groupLabel, displayLocale) ||
        first.displayLabel.localeCompare(second.displayLabel, displayLocale),
    );
}
