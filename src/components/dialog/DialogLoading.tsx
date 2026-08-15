import { t, type Language } from "../../i18n";

interface DialogLoadingProps {
  language: Language;
}

export function DialogLoading({ language }: DialogLoadingProps) {
  return (
    <div className="dialog-loading-overlay">
      <div className="dialog-loading" role="status" aria-live="polite">
        <span className="dialog-loading__spinner" aria-hidden="true" />
        <span>{t(language, "loading")}</span>
      </div>
    </div>
  );
}
