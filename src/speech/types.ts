export interface VoiceOption {
  /** Voice identifier - used as the value for voiceName setting */
  id: string;
  name: string;
  lang: string;
  /** TTS engine that provides this voice (derived heuristically) */
  engine: string;
  /** true when the voice needs a network connection (native) */
  isNetworkConnectionRequired?: boolean;
}

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Matches VoiceOption.id */
  voiceName?: string;
  queueStrategy?: "flush" | "queue";
}

export interface SpeechDriverCallbacks {
  onSpeakingChange: (speaking: boolean) => void;
  onVoicesChange: (voices: VoiceOption[]) => void;
  onVoicesLoadedChange: (loaded: boolean) => void;
  onSupportedChange: (supported: boolean) => void;
  onReady: () => void;
  onError: (error: Error) => void;
}

export interface SpeechDriver {
  initialize(): void;
  speak(text: string, options: SpeechOptions): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  cleanup(): void;
}

/** Known TTS engine identifier patterns -> human-readable engine name. */
const ENGINE_PATTERNS: Array<[RegExp, string]> = [
  [/com\.google/i, "Google"],
  [/^Google\b/i, "Google"],
  [/com\.samsung/i, "Samsung"],
  [/^Samsung\b/i, "Samsung"],
  [/com\.nuance/i, "Nuance"],
  [/^Nuance\b/i, "Nuance"],
  [/com\.svox/i, "SVOX"],
  [/^SVOX\b/i, "SVOX"],
  [/com\.ivona/i, "Ivona"],
  [/^Ivona\b/i, "Ivona"],
  [/espeak/i, "eSpeak"],
  [/com\.apple/i, "Apple"],
  [/^Apple\b/i, "Apple"],
  [/com\.sobtec/i, "Speakng"],
  [/speakng/i, "Speakng"],
  [/com\.soft4m/i, "Capella"],
  [/capella/i, "Capella"],
  [/com\.cereproc/i, "CereProc"],
  [/cereproc/i, "CereProc"],
  [/com\.acapela/i, "Acapela"],
  [/acapela/i, "Acapela"],
  [/com\.cepstral/i, "Cepstral"],
  [/com\.vocalware/i, "VocalWare"],
  [/com\.loquendo/i, "Loquendo"],
  [/loquendo/i, "Loquendo"],
  [/com\.microsoft/i, "Microsoft"],
  [/^Microsoft\b/i, "Microsoft"],
  [/com\.amazon/i, "Amazon"],
  [/^Amazon\b/i, "Amazon"],
];

/** Derive a human-readable TTS engine name from a voice's id and name fields. */
export function detectTTSEngine(voice: { id: string; name: string }): string {
  const candidate = `${voice.id} ${voice.name}`;
  for (const [pattern, label] of ENGINE_PATTERNS) {
    if (pattern.test(candidate)) return label;
  }
  return "Device";
}

export function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error(fallbackMessage);
}
