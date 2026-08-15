import { Languages, Music2 } from "lucide-react";
import { LANGUAGE_OPTIONS, t, type Language } from "../../i18n";

interface AppSettingsTabProps {
  id: string;
  hidden: boolean;
  language: Language;
  sentenceBuilderEnabled: boolean;
  onLanguageChange: (language: Language) => void;
  onSentenceBuilderToggle: (enabled: boolean) => void;
}

export function AppSettingsTab({
  id,
  hidden,
  language,
  sentenceBuilderEnabled,
  onLanguageChange,
  onSentenceBuilderToggle,
}: AppSettingsTabProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby="settings-tab-app"
      hidden={hidden}
      className="settings-tabpanel"
    >
      <div className="settings-field">
        <label className="settings-field__label" htmlFor="language-select">
          <Languages className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "language")}
        </label>
        <select
          id="language-select"
          className="settings-field__select"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as Language)}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-field">
        <span className="settings-field__label">
          <Music2 className="settings-field__label-icon" aria-hidden="true" focusable="false" />
          {t(language, "sentenceBuilderMode")}
        </span>
        <div
          className="settings-toggle-group"
          role="group"
          aria-label={t(language, "sentenceBuilderMode")}
        >
          <button
            type="button"
            className={`settings-toggle-btn${sentenceBuilderEnabled ? " settings-toggle-btn--active" : ""}`}
            onClick={() => onSentenceBuilderToggle(true)}
            aria-pressed={sentenceBuilderEnabled}
          >
            {t(language, "sentenceBuilderOn")}
          </button>
          <button
            type="button"
            className={`settings-toggle-btn${!sentenceBuilderEnabled ? " settings-toggle-btn--active" : ""}`}
            onClick={() => onSentenceBuilderToggle(false)}
            aria-pressed={!sentenceBuilderEnabled}
          >
            {t(language, "sentenceBuilderOff")}
          </button>
        </div>
        <p className="settings-field__hint">
          {sentenceBuilderEnabled
            ? t(language, "sentenceBuilderOnHint")
            : t(language, "sentenceBuilderOffHint")}
        </p>
      </div>
    </div>
  );
}
