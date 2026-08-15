import { Component, type ErrorInfo, type ReactNode } from "react";
import { t, type Language } from "../../i18n";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // The fallback remains usable even when application reporting is unavailable.
  }

  render() {
    if (!this.state.error) return this.props.children;

    const language = getDocumentLanguage();
    return (
      <main className="app-error" role="alert">
        <img
          src={`${import.meta.env.BASE_URL}brand/logo-150.png`}
          className="app-error__logo"
          alt=""
        />
        <h1 className="app-error__title">{t(language, "unexpectedError")}</h1>
        <p className="app-error__message">{t(language, "unexpectedErrorHint")}</p>
        <button
          type="button"
          className="app-error__reload"
          onClick={() => globalThis.location.reload()}
        >
          {t(language, "reloadApp")}
        </button>
      </main>
    );
  }
}

function getDocumentLanguage(): Language {
  const language = document.documentElement.lang;
  return language === "es" || language === "fr" ? language : "en";
}
