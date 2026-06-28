import { useState, useEffect, useCallback, useRef } from "react";

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

  useEffect(() => {
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
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || !text.trim()) return;

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
  }, []);

  const cancel = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, cancel, speaking, voices, supported };
}
