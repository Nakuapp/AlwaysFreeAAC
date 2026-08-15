import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { BrowserSpeechDriver } from "./browserSpeechDriver";
import { NativeSpeechDriver } from "./nativeSpeechDriver";
import type { SpeechDriver, SpeechOptions, VoiceOption } from "./types";

export { detectTTSEngine } from "./types";
export type { VoiceOption } from "./types";

export interface UseSpeechOptions extends SpeechOptions {
  onError?: (error: Error) => void;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const optionsRef = useRef(options);
  const driverRef = useRef<SpeechDriver | null>(null);
  optionsRef.current = options;
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const reportError = (operationalError: Error) => {
      setError(operationalError);
      optionsRef.current.onError?.(operationalError);
    };
    const callbacks = {
      onSpeakingChange: setSpeaking,
      onVoicesChange: setVoices,
      onVoicesLoadedChange: setVoicesLoaded,
      onSupportedChange: setSupported,
      onReady: () => setError(null),
      onError: reportError,
    };
    const driver: SpeechDriver = isNative
      ? new NativeSpeechDriver(callbacks)
      : new BrowserSpeechDriver(callbacks);

    driverRef.current = driver;
    driver.initialize();
    return () => {
      driver.cleanup();
      if (driverRef.current === driver) driverRef.current = null;
    };
  }, [isNative]);

  /** Sorted, deduplicated list of TTS engine names derived from the loaded voices. */
  const availableEngines = useMemo(
    () => Array.from(new Set(voices.map((v) => v.engine))).sort(),
    [voices],
  );

  const speakText = useCallback((text: string, overrideOptions?: SpeechOptions) => {
    if (!text.trim()) return;
    const { rate, pitch, volume, voiceName } = { ...optionsRef.current, ...overrideOptions };
    setError(null);
    driverRef.current?.speak(text, { rate, pitch, volume, voiceName });
  }, []);

  // Convenience wrapper that keeps the public API name "speak"
  const speak = useCallback((text: string) => speakText(text), [speakText]);

  /** Preview a specific voice without changing the current settings */
  const previewVoice = useCallback(
    (voiceId: string, sampleText: string) => {
      speakText(sampleText, { voiceName: voiceId });
    },
    [speakText],
  );

  const cancel = useCallback(() => driverRef.current?.cancel(), []);
  const pause = useCallback(() => driverRef.current?.pause(), []);
  const resume = useCallback(() => driverRef.current?.resume(), []);

  return {
    speak,
    previewVoice,
    cancel,
    pause,
    resume,
    speaking,
    voices,
    availableEngines,
    supported,
    voicesLoaded,
    error,
  };
}
