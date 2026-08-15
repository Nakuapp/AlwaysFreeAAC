import { useCallback, useState } from "react";
import type { Symbol } from "../../domain";
import { playAudio } from "../../services/browserMedia";
import type { SpeechOptions } from "../../speech/types";

interface UseSentenceOptions {
  sentenceBuilderEnabled: boolean;
  volume: number;
  speak: (text: string, options?: SpeechOptions) => void;
  onError?: (error: Error) => void;
}

export function useSentence({
  sentenceBuilderEnabled,
  volume,
  speak,
  onError,
}: UseSentenceOptions) {
  const [sentence, setSentence] = useState<Symbol[]>([]);

  const playSymbol = useCallback(
    (symbol: Symbol) => {
      if (symbol.soundFile) {
        void playAudio(symbol.soundFile, volume).catch((error) =>
          onError?.(error instanceof Error ? error : new Error("Audio playback failed.")),
        );
        return;
      }
      speak(symbol.speak ?? symbol.label, { queueStrategy: "flush" });
    },
    [onError, speak, volume],
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
    speak(sentence.map((symbol) => symbol.speak ?? symbol.label).join(" "), {
      queueStrategy: "flush",
    });
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
