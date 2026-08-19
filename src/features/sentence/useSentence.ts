import { useCallback, useState } from "react";
import type { Symbol } from "../../domain";
import { playAudio } from "../../services/browserMedia";
import type { SpeechOptions } from "../../speech/types";

interface UseSentenceOptions {
  sentenceBuilderEnabled: boolean;
  volume: number;
  rate: number;
  speak: (text: string, options?: SpeechOptions) => void;
  onError?: (error: Error) => void;
}

export function useSentence({
  sentenceBuilderEnabled,
  volume,
  rate,
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
      } else {
        speak(symbol.speak ?? symbol.label, { queueStrategy: "flush" });
      }
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

  const speakSentence = useCallback(async () => {
    if (sentence.length === 0) return;

    type SpeechGroup = { type: "speech"; words: string[] };
    type SoundGroup = { type: "sound"; sound: string };
    type SentenceGroup = SpeechGroup | SoundGroup;
    const groups: SentenceGroup[] = [];

    for (const symbol of sentence) {
      if (symbol.soundFile) {
        groups.push({ type: "sound", sound: symbol.soundFile });
      } else {
        const text = symbol.speak ?? symbol.label ?? "";
        const lastGroup = groups[groups.length - 1];

        if (lastGroup?.type === "speech") {
          lastGroup.words.push(text);
        } else {
          groups.push({ type: "speech", words: [text] });
        }
      }
    }

    for (const group of groups) {
      try {
        if (group.type === "sound") {
          await new Promise<void>((resolve, reject) => {
            playAudio(group.sound, volume).then(resolve).catch(reject);
          });
        } else if (group.type === "speech") {
          const combinedPhrase = group.words.join(", ");
          const charCount = combinedPhrase.length;

          // 1. Establish your base rate limits
          const minRate = 0.7; // Hard floor for ultra-short text (e.g., "OK")
          const targetRate = rate; // Normal speaking speed

          // 2. Linear scaling up to 15 characters, capped cleanly at 1.0
          // If charCount is 2 ("Hi"), rate is roughly 0.74. If 15+ chars, rate is 1.0.
          const calculatedRate = minRate + (charCount / 15) * (targetRate - minRate);
          const dynamicRate = Math.min(targetRate, calculatedRate);

          await new Promise((resolve) => {
            speak(combinedPhrase, {
              queueStrategy: "queue",
              rate: Number(dynamicRate.toFixed(2)), // Keeps clean decimal values
            });

            const checkSpeaking = setInterval(() => {
              if (!window.speechSynthesis.speaking) {
                clearInterval(checkSpeaking);
                resolve(undefined);
              }
            }, 100);
          });
        }
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error("Sentence playback failed."));
      }
    }
  }, [sentence, playAudio, speak, volume, onError]);

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
