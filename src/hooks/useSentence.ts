import { useCallback, useState } from "react";
import type { Symbol } from "../data/vocabulary";

interface UseSentenceOptions {
  sentenceBuilderEnabled: boolean;
  volume: number;
  speak: (text: string) => void;
}

export function useSentence({ sentenceBuilderEnabled, volume, speak }: UseSentenceOptions) {
  const [sentence, setSentence] = useState<Symbol[]>([]);

  const playSymbol = useCallback(
    (symbol: Symbol) => {
      if (symbol.soundFile) {
        const audio = new Audio(symbol.soundFile);
        audio.volume = volume;
        audio.play().catch(() => {});
        return;
      }
      speak(symbol.speak ?? symbol.label);
    },
    [speak, volume],
  );

  const selectSymbol = useCallback(
    (symbol: Symbol) => {
      if (sentenceBuilderEnabled) {
        setSentence((previous) => [...previous, symbol]);
        return;
      }
      playSymbol(symbol);
    },
    [playSymbol, sentenceBuilderEnabled],
  );

  const speakSentence = useCallback(() => {
    if (sentence.length === 0) return;
    speak(sentence.map((symbol) => symbol.speak ?? symbol.label).join(" "));
  }, [sentence, speak]);

  const removeLast = useCallback(() => {
    setSentence((previous) => previous.slice(0, -1));
  }, []);

  const removeWord = useCallback((index: number) => {
    setSentence((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  }, []);

  const clear = useCallback(() => {
    setSentence([]);
  }, []);

  return {
    sentence,
    selectSymbol,
    speakSentence,
    speakWord: playSymbol,
    removeLast,
    removeWord,
    clear,
  };
}
