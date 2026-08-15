import {
  detectTTSEngine,
  toError,
  type SpeechDriver,
  type SpeechDriverCallbacks,
  type SpeechOptions,
  type VoiceOption,
} from "./types";

export class BrowserSpeechDriver implements SpeechDriver {
  private fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  private activeUtterance: SpeechSynthesisUtterance | undefined;
  private readonly callbacks: SpeechDriverCallbacks;

  constructor(callbacks: SpeechDriverCallbacks) {
    this.callbacks = callbacks;
  }

  initialize(): void {
    if (!("speechSynthesis" in window)) return;

    this.callbacks.onSupportedChange(true);
    this.loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", this.loadVoices);
    this.fallbackTimer = setTimeout(() => {
      this.callbacks.onVoicesChange(this.getVoiceOptions());
      this.callbacks.onVoicesLoadedChange(true);
    }, 3000);
    this.callbacks.onReady();
  }

  speak(text: string, options: SpeechOptions): void {
    if (!("speechSynthesis" in window)) return;

    try {
      const { rate = 1, pitch = 1, volume = 1, voiceName } = options;
      this.callbacks.onSpeakingChange(false);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      this.activeUtterance = undefined;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (voiceName) {
        const match = window.speechSynthesis.getVoices().find((voice) => voice.name === voiceName);
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => {
        if (this.activeUtterance === utterance) this.callbacks.onSpeakingChange(true);
      };
      utterance.onend = () => {
        if (this.activeUtterance !== utterance) return;
        this.activeUtterance = undefined;
        this.callbacks.onSpeakingChange(false);
      };
      utterance.onerror = (event) => {
        if (this.activeUtterance !== utterance) return;
        this.activeUtterance = undefined;
        this.callbacks.onSpeakingChange(false);
        if (event.error === "canceled" || event.error === "interrupted") return;
        this.callbacks.onError(new Error(`Speech synthesis failed: ${event.error}`));
      };
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      this.callbacks.onSpeakingChange(false);
      this.callbacks.onError(toError(error, "Speech synthesis failed"));
    }
  }

  cancel(): void {
    if (!("speechSynthesis" in window)) return;
    try {
      this.activeUtterance = undefined;
      window.speechSynthesis.cancel();
      this.callbacks.onSpeakingChange(false);
    } catch (error) {
      this.callbacks.onSpeakingChange(false);
      this.callbacks.onError(toError(error, "Failed to cancel speech"));
    }
  }

  pause(): void {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.pause();
    } catch (error) {
      this.callbacks.onError(toError(error, "Failed to pause speech"));
    }
  }

  resume(): void {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.resume();
      if (window.speechSynthesis.speaking) this.callbacks.onSpeakingChange(true);
    } catch (error) {
      this.callbacks.onError(toError(error, "Failed to resume speech"));
    }
  }

  cleanup(): void {
    if (!("speechSynthesis" in window)) return;
    this.activeUtterance = undefined;
    window.speechSynthesis.removeEventListener("voiceschanged", this.loadVoices);
    if (this.fallbackTimer !== undefined) clearTimeout(this.fallbackTimer);
  }

  private readonly loadVoices = (): void => {
    const voices = this.getVoiceOptions();
    if (voices.length === 0) return;
    this.callbacks.onVoicesChange(voices);
    this.callbacks.onVoicesLoadedChange(true);
  };

  private getVoiceOptions(): VoiceOption[] {
    return window.speechSynthesis.getVoices().map((voice) => ({
      id: voice.name,
      name: voice.name,
      lang: voice.lang,
      engine: detectTTSEngine({ id: voice.voiceURI ?? "", name: voice.name }),
    }));
  }
}
