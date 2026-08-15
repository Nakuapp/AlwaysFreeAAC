import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSettings } from "../../domain";
import { loadSettings, saveSettings } from "../../persistence/settingsStorage";
import { browserStorage, type KeyValueStorage } from "../../persistence/storage";

export function useAppSettings(
  onError?: (error: Error) => void,
  storage: KeyValueStorage = browserStorage,
) {
  const [initialLoad] = useState(() => loadSettings(storage));
  const [settings, setSettings] = useState<AppSettings>(() =>
    initialLoad.ok ? initialLoad.value : initialLoad.fallback,
  );
  const initialLoadReportedRef = useRef(false);
  const initialSaveSkippedRef = useRef(false);

  useEffect(() => {
    if (initialLoadReportedRef.current || !onError) return;
    initialLoadReportedRef.current = true;
    if (!initialLoad.ok) onError(initialLoad.error);
    initialLoad.warnings.forEach(onError);
  }, [initialLoad, onError]);

  useEffect(() => {
    if (!initialSaveSkippedRef.current) {
      initialSaveSkippedRef.current = true;
      return;
    }
    const result = saveSettings(settings, storage);
    if (!result.ok) onError?.(result.error);
    result.warnings.forEach((warning) => onError?.(warning));
  }, [onError, settings, storage]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font-size", `${settings.fontSize}px`);
  }, [settings.fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", settings.themeAccent);
  }, [settings.themeAccent]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const updateSetting = useCallback(
    <Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) => {
      setSettings((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const applyVoicePreset = useCallback((preset: string) => {
    switch (preset) {
      case "baritone":
        setSettings((previous) => ({
          ...previous,
          voicePreset: "baritone",
          rate: 0.95,
          pitch: 0.75,
        }));
        return;
      case "alto":
        setSettings((previous) => ({ ...previous, voicePreset: "alto", rate: 1.05, pitch: 1.25 }));
        return;
      case "soprano":
        setSettings((previous) => ({
          ...previous,
          voicePreset: "soprano",
          rate: 1.15,
          pitch: 1.45,
        }));
        return;
      case "bass":
        setSettings((previous) => ({ ...previous, voicePreset: "bass", rate: 0.85, pitch: 0.6 }));
        return;
      default:
        setSettings((previous) => ({ ...previous, voicePreset: "custom" }));
    }
  }, []);

  const updateRate = useCallback((rate: number) => {
    setSettings((previous) => ({ ...previous, rate, voicePreset: "custom" }));
  }, []);

  const updatePitch = useCallback((pitch: number) => {
    setSettings((previous) => ({ ...previous, pitch, voicePreset: "custom" }));
  }, []);

  return {
    settings,
    updateSetting,
    applyVoicePreset,
    updateRate,
    updatePitch,
  };
}
