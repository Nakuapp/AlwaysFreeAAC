import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechSynthesis } from "@capgo/capacitor-speech-synthesis";
import type { VoiceInfo } from "@capgo/capacitor-speech-synthesis";

export interface VoiceOption {
  /** Voice identifier – used as the value for voiceName setting */
  id: string;
  name: string;
  lang: string;
  /** true when the voice needs a network connection (native) */
  isNetworkConnectionRequired?: boolean;
}

export interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Matches VoiceOption.id */
  voiceName?: string;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const nativeVoicesRef = useRef<VoiceInfo[]>([]);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      setSupported(true);
      SpeechSynthesis.getVoices()
        .then(({ voices: nativeVoices }) => {
          nativeVoicesRef.current = nativeVoices;
          setVoices(
            nativeVoices.map((v) => ({
              id: v.id,
              name: v.name,
              lang: v.language,
              isNetworkConnectionRequired: v.isNetworkConnectionRequired,
            }))
          );
        })
        .catch(() => {
          // Voice enumeration unavailable on some Android versions; default voice will be used
        });
      return;
    }

    if (!("speechSynthesis" in window)) return;
    setSupported(true);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;
      setVoices(
        available.map((v) => ({ id: v.name, name: v.name, lang: v.lang }))
      );
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isNative]);

  const speakText = useCallback(
    (text: string, overrideOptions?: UseSpeechOptions) => {
      if (!text.trim()) return;
      const merged = { ...optionsRef.current, ...overrideOptions };
      const { rate = 1, pitch = 1, volume = 1, voiceName } = merged;

      if (isNative) {
        const voiceInfo = voiceName
          ? nativeVoicesRef.current.find((v) => v.id === voiceName)
          : undefined;
        setSpeaking(true);
        SpeechSynthesis.speak({
          text,
          rate,
          pitch,
          volume,
          queueStrategy: "Flush",
          ...(voiceInfo && { voiceId: voiceInfo.id, language: voiceInfo.language }),
        })
          .then(() => setSpeaking(false))
          .catch(() => setSpeaking(false));
        return;
      }

      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

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
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isNative]
  );

  // Convenience wrapper that keeps the public API name "speak"
  const speak = useCallback(
    (text: string) => speakText(text),
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

  return { speak, previewVoice, cancel, pause, resume, speaking, voices, supported };
}
