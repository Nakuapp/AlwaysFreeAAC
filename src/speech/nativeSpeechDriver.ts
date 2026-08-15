import type { PluginListenerHandle } from "@capacitor/core";
import { SpeechSynthesis } from "@capgo/capacitor-speech-synthesis";
import type { VoiceInfo } from "@capgo/capacitor-speech-synthesis";
import {
  detectTTSEngine,
  toError,
  type SpeechDriver,
  type SpeechDriverCallbacks,
  type SpeechOptions,
} from "./types";

export class NativeSpeechDriver implements SpeechDriver {
  private nativeVoices: VoiceInfo[] = [];
  private listenerHandles: PluginListenerHandle[] = [];
  private retryTimers: Array<ReturnType<typeof setTimeout>> = [];
  private cancelled = false;
  private readonly callbacks: SpeechDriverCallbacks;

  constructor(callbacks: SpeechDriverCallbacks) {
    this.callbacks = callbacks;
  }

  initialize(): void {
    this.callbacks.onSupportedChange(true);
    this.loadVoicesWithRetry(0);
    this.registerListener("start", () => this.callbacks.onSpeakingChange(true));
    this.registerListener("end", () => this.callbacks.onSpeakingChange(false));
    this.registerErrorListener();
    this.callbacks.onReady();
  }

  speak(text: string, options: SpeechOptions): void {
    const { rate = 1, pitch = 1, volume = 1, voiceName, queueStrategy = "flush" } = options;
    const voiceInfo = voiceName
      ? this.nativeVoices.find((voice) => voice.id === voiceName)
      : undefined;
    const language =
      voiceInfo?.language ??
      (typeof navigator !== "undefined" ? navigator.language : undefined) ??
      "en-US";

    this.callbacks.onSpeakingChange(true);
    SpeechSynthesis.speak({
      text,
      rate,
      pitch,
      volume,
      queueStrategy: queueStrategy === "queue" ? "Add" : "Flush",
      language,
      ...(voiceInfo && { voiceId: voiceInfo.id }),
    }).catch((error: unknown) => {
      if (this.cancelled) return;
      this.callbacks.onSpeakingChange(false);
      this.callbacks.onError(toError(error, "Native speech synthesis failed"));
    });
  }

  cancel(): void {
    SpeechSynthesis.cancel()
      .then(() => {
        if (!this.cancelled) this.callbacks.onSpeakingChange(false);
      })
      .catch((error: unknown) => {
        if (this.cancelled) return;
        this.callbacks.onSpeakingChange(false);
        this.callbacks.onError(toError(error, "Failed to cancel native speech"));
      });
  }

  pause(): void {
    SpeechSynthesis.pause().catch((error: unknown) => {
      if (!this.cancelled) {
        this.callbacks.onError(toError(error, "Failed to pause native speech"));
      }
    });
  }

  resume(): void {
    SpeechSynthesis.resume().catch((error: unknown) => {
      if (!this.cancelled) {
        this.callbacks.onError(toError(error, "Failed to resume native speech"));
      }
    });
  }

  cleanup(): void {
    this.cancelled = true;
    this.retryTimers.forEach(clearTimeout);
    this.listenerHandles.forEach((handle) => void handle.remove().catch(() => {}));
  }

  private loadVoicesWithRetry(attempt: number): void {
    SpeechSynthesis.getVoices()
      .then(({ voices }) => {
        if (this.cancelled) return;
        this.nativeVoices = voices;
        if (voices.length === 0 && attempt < 3) {
          this.scheduleVoiceRetry(attempt);
          return;
        }
        this.callbacks.onVoicesChange(
          voices.map((voice) => ({
            id: voice.id,
            name: voice.name,
            lang: voice.language,
            engine: detectTTSEngine(voice),
            isNetworkConnectionRequired: voice.isNetworkConnectionRequired,
          })),
        );
        this.callbacks.onVoicesLoadedChange(true);
      })
      .catch((error: unknown) => {
        if (this.cancelled) return;
        if (attempt < 3) {
          this.scheduleVoiceRetry(attempt);
          return;
        }
        this.callbacks.onVoicesLoadedChange(true);
        this.callbacks.onError(toError(error, "Failed to load native speech voices"));
      });
  }

  private scheduleVoiceRetry(attempt: number): void {
    const timer = setTimeout(() => this.loadVoicesWithRetry(attempt + 1), (attempt + 1) * 750);
    this.retryTimers.push(timer);
  }

  private registerListener(eventName: "start" | "end", listener: () => void): void {
    const registration =
      eventName === "start"
        ? SpeechSynthesis.addListener("start", listener)
        : SpeechSynthesis.addListener("end", listener);
    registration
      .then((handle) => this.storeListenerHandle(handle))
      .catch((error: unknown) => {
        if (!this.cancelled) {
          this.callbacks.onError(toError(error, `Failed to register native ${eventName} listener`));
        }
      });
  }

  private registerErrorListener(): void {
    SpeechSynthesis.addListener("error", (event) => {
      if (this.cancelled) return;
      this.callbacks.onSpeakingChange(false);
      this.callbacks.onError(new Error(event.error));
    })
      .then((handle) => this.storeListenerHandle(handle))
      .catch((error: unknown) => {
        if (!this.cancelled) {
          this.callbacks.onError(toError(error, "Failed to register native error listener"));
        }
      });
  }

  private storeListenerHandle(handle: PluginListenerHandle): void {
    if (this.cancelled) {
      void handle.remove().catch(() => {});
      return;
    }
    this.listenerHandles.push(handle);
  }
}
