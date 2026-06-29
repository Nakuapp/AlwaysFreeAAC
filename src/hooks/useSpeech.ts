import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

export interface VoiceOption {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

export interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const nativeVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      setSupported(true);
      TextToSpeech.getSupportedVoices()
        .then(({ voices: nativeVoices }) => {
          nativeVoicesRef.current = nativeVoices;
          setVoices(
            nativeVoices.map((v) => ({ name: v.name, lang: v.lang, voice: v }))
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
        available.map((v) => ({ name: v.name, lang: v.lang, voice: v }))
      );
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isNative]);

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      if (isNative) {
        const { rate = 1, pitch = 1, volume = 1, voiceName } = optionsRef.current;
        const idx = voiceName
          ? nativeVoicesRef.current.findIndex((v) => v.name === voiceName)
          : -1;
        setSpeaking(true);
        TextToSpeech.speak({
          text,
          rate,
          pitch,
          volume,
          ...(idx >= 0 && { voice: idx }),
        })
          .then(() => setSpeaking(false))
          .catch(() => setSpeaking(false));
        return;
      }

      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const { rate = 1, pitch = 1, volume = 1, voiceName } = optionsRef.current;

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

  const cancel = useCallback(() => {
    if (isNative) {
      TextToSpeech.stop()
        .then(() => setSpeaking(false))
        .catch(() => setSpeaking(false));
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [isNative]);

  return { speak, cancel, speaking, voices, supported };
}
