import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechSynthesis } from "@capgo/capacitor-speech-synthesis";
import type { VoiceInfo } from "@capgo/capacitor-speech-synthesis";

export interface VoiceOption {
  /** Voice identifier – used as the value for voiceName setting */
  id: string;
  name: string;
  lang: string;
  /** TTS engine that provides this voice (derived heuristically) */
  engine: string;
  /** true when the voice needs a network connection (native) */
  isNetworkConnectionRequired?: boolean;
}

/** Known TTS engine identifier patterns → human-readable engine name. */
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

/** Derive a human-readable TTS engine name from a voice's id and name fields.
 *  Returns "Device" (not "System") for unrecognised engines to avoid a
 *  name collision with the "System" (all-engines) option in the TTS engine
 *  dropdown whose label comes from the ttsEngineAll i18n key.
 */
export function detectTTSEngine(voice: { id: string; name: string }): string {
  const candidate = `${voice.id} ${voice.name}`;
  for (const [pattern, label] of ENGINE_PATTERNS) {
    if (pattern.test(candidate)) return label;
  }
  return "Device";
}

export interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Matches VoiceOption.id */
  voiceName?: string;
  queueStrategy?: "flush" | "queue";
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const nativeVoicesRef = useRef<VoiceInfo[]>([]);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      setSupported(true);

      /**
       * Attempt to load voices from the native TTS engine. The engine is
       * initialised asynchronously so the first call may return an empty list;
       * retry with linear back-off (750 ms, 1.5 s, 2.25 s) before giving up.
       */
      let cancelled = false;
      const loadVoicesWithRetry = (attempt: number) => {
        if (cancelled) return;
        SpeechSynthesis.getVoices()
          .then(({ voices: nativeVoices }) => {
            if (cancelled) return;
            nativeVoicesRef.current = nativeVoices;
            if (nativeVoices.length === 0 && attempt < 3) {
              // TTS engine not yet ready — retry with back-off
              setTimeout(() => loadVoicesWithRetry(attempt + 1), (attempt + 1) * 750);
              return;
            }
            setVoices(
              nativeVoices.map((v) => ({
                id: v.id,
                name: v.name,
                lang: v.language,
                engine: detectTTSEngine(v),
                isNetworkConnectionRequired: v.isNetworkConnectionRequired,
              }))
            );
            setVoicesLoaded(true);
          })
          .catch(() => {
            if (cancelled) return;
            if (attempt < 3) {
              setTimeout(() => loadVoicesWithRetry(attempt + 1), (attempt + 1) * 750);
            } else {
              setVoicesLoaded(true);
            }
          });
      };
      loadVoicesWithRetry(0);

      // Use plugin events for accurate speaking state on native (the promise resolves
      // before speech actually starts, so the indicator would otherwise flicker off immediately).
      const listenerRemovers: Array<() => Promise<void>> = [];

      SpeechSynthesis.addListener("start", () => setSpeaking(true))
        .then((h) => {
          if (cancelled) {
            h.remove().catch(() => {});
            return;
          }
          listenerRemovers.push(() => h.remove());
        })
        .catch(() => {});
      SpeechSynthesis.addListener("end", () => setSpeaking(false))
        .then((h) => {
          if (cancelled) {
            h.remove().catch(() => {});
            return;
          }
          listenerRemovers.push(() => h.remove());
        })
        .catch(() => {});
      SpeechSynthesis.addListener("error", () => setSpeaking(false))
        .then((h) => {
          if (cancelled) {
            h.remove().catch(() => {});
            return;
          }
          listenerRemovers.push(() => h.remove());
        })
        .catch(() => {});

      return () => {
        cancelled = true;
        listenerRemovers.forEach((remove) => remove().catch(() => {}));
      };
    }

    if (!("speechSynthesis" in window)) return;
    setSupported(true);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;
      setVoices(
        available.map((v) => ({
          id: v.name,
          name: v.name,
          lang: v.lang,
          engine: detectTTSEngine({ id: v.voiceURI ?? "", name: v.name }),
        }))
      );
      setVoicesLoaded(true);
    };

    loadVoices();
    // voiceschanged fires in most browsers once voices are ready
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    // If voiceschanged never fires (e.g. Firefox, some Safari versions), make one
    // final attempt to read voices before marking as loaded so the UI settles.
    const fallbackTimer = setTimeout(() => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(
          available.map((v) => ({
            id: v.name,
            name: v.name,
            lang: v.lang,
            engine: detectTTSEngine({ id: v.voiceURI ?? "", name: v.name }),
          }))
        );
      }
      setVoicesLoaded(true);
    }, 3000);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      clearTimeout(fallbackTimer);
    };
  }, [isNative]);

  /** Sorted, deduplicated list of TTS engine names derived from the loaded voices. */
  const availableEngines = useMemo(
    () => Array.from(new Set(voices.map((v) => v.engine))).sort(),
    [voices]
  );

  const speakText = useCallback(
    (text: string, overrideOptions?: UseSpeechOptions) => {
      if (!text.trim()) return;
      const merged = { ...optionsRef.current, ...overrideOptions };
      const { rate = 1, pitch = 1, volume = 1, voiceName, queueStrategy = "flush" } = merged;

      if (isNative) {
        const voiceInfo = voiceName
          ? nativeVoicesRef.current.find((v) => v.id === voiceName)
          : undefined;
        // Always include a language so the native TTS engine can select an appropriate
        // voice. Without an explicit language some Android engines produce no audio.
        // Prefer the matched voice's language, then the system locale, then "en-US".
        const language =
          voiceInfo?.language ??
          (typeof navigator !== "undefined" ? navigator.language : undefined) ??
          "en-US";
        // Set speaking immediately so the UI indicator responds before the async
        // native event arrives; the "end"/"error" plugin event clears it.
        setSpeaking(true);
        SpeechSynthesis.speak({
          text,
          rate,
          pitch,
          volume,
          queueStrategy: queueStrategy === "queue" ? "Add" : "Flush",
          language,
          ...(voiceInfo && { voiceId: voiceInfo.id }),
        })
          .catch(() => setSpeaking(false));
        return;
      }

      if (!("speechSynthesis" in window)) return;

      // Resume synthesis if the browser paused it (e.g. page was backgrounded).
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      if (queueStrategy === "flush") {
        // Reset any stuck speaking state before starting new speech.
        setSpeaking(false);
        // Cancel any in-progress or queued speech.
        window.speechSynthesis.cancel();
      }

      // Speak synchronously — calling speak() inside setTimeout loses the
      // user-gesture context that iOS Safari requires, causing silent failures.
      // Modern Chromium no longer requires a delay after cancel(), matching the
      // behaviour of the capgo plugin's own web implementation.
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (voiceName) {
        const match = window.speechSynthesis
          .getVoices()
          .find((v) => v.name === voiceName);
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(window.speechSynthesis.speaking);
      utterance.onerror = () => setSpeaking(window.speechSynthesis.speaking);

      window.speechSynthesis.speak(utterance);
    },
    [isNative]
  );

  // Convenience wrapper that keeps the public API name "speak"
  const speak = useCallback(
    (text: string, overrideOptions?: UseSpeechOptions) => speakText(text, overrideOptions),
    [speakText]
  );

  /** Preview a specific voice without changing the current settings */
  const previewVoice = useCallback(
    (voiceId: string, sampleText: string) => {
      speakText(sampleText, { voiceName: voiceId });
    },
    [speakText]
  );

  const cancel = useCallback(() => {
    if (isNative) {
      SpeechSynthesis.cancel()
        .then(() => setSpeaking(false))
        .catch(() => setSpeaking(false));
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [isNative]);

  const pause = useCallback(() => {
    if (isNative) {
      SpeechSynthesis.pause()
        .catch(() => {
          // ignore
        });
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  }, [isNative]);

  const resume = useCallback(() => {
    if (isNative) {
      SpeechSynthesis.resume()
        .catch(() => {
          // ignore
        });
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      if (window.speechSynthesis.speaking) setSpeaking(true);
    }
  }, [isNative]);

  return { speak, previewVoice, cancel, pause, resume, speaking, voices, availableEngines, supported, voicesLoaded };
}
