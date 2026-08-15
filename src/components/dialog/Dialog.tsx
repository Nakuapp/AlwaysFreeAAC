import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "./useFocusTrap";
import "./Dialog.css";

interface DialogProps {
  /** Text or element rendered inside the title h2 */
  title: ReactNode;
  /** Unique id for aria-labelledby on the panel */
  titleId: string;
  /** aria-label for the X close button */
  closeLabel: string;
  onClose: () => void;
  /** Scrollable body content */
  children: ReactNode;
  /** Slot rendered between the header and body (e.g. tab bars, preview rows) */
  headerExtension?: ReactNode;
  /** Footer content; if omitted no footer is rendered */
  footer?: ReactNode;
  /** CSS max-width for the panel (default: "460px") */
  maxWidth?: string;
  /** CSS max-height for the panel (default: "92vh") */
  maxHeight?: string;
  /** Whether clicking the backdrop closes the dialog (default: false) */
  dismissOnOverlayClick?: boolean;
  /** Additional class name added to the panel element */
  panelClassName?: string;
  /** Additional class name added to the body element */
  bodyClassName?: string;
  /**
   * Element to focus on mount.
   * Defaults to the close button when omitted.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function Dialog({
  title,
  titleId,
  closeLabel,
  onClose,
  children,
  headerExtension,
  footer,
  maxWidth = "460px",
  maxHeight = "92vh",
  dismissOnOverlayClick = false,
  panelClassName,
  bodyClassName,
  initialFocusRef,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(panelRef);

  // Focus the initial element (or the close button) on mount (WCAG 2.4.3)
  useEffect(() => {
    const target = initialFocusRef?.current ?? closeButtonRef.current;
    target?.focus();
  }, [initialFocusRef]); // initialFocusRef is a stable RefObject; effect is intentionally mount-only

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="dialog-overlay"
      onClick={
        dismissOnOverlayClick
          ? (e) => {
              if (e.target === e.currentTarget) onClose();
            }
          : undefined
      }
    >
      <div
        className={`dialog-panel${panelClassName ? ` ${panelClassName}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        style={{ maxWidth, maxHeight }}
      >
        <div className="dialog-panel__header">
          <h2 className="dialog-panel__title" id={titleId}>
            {title}
          </h2>
          <button
            className="dialog-panel__close"
            onClick={onClose}
            type="button"
            aria-label={closeLabel}
            ref={closeButtonRef}
          >
            <X className="dialog-panel__close-icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {headerExtension}

        <div className={`dialog-panel__body${bodyClassName ? ` ${bodyClassName}` : ""}`}>
          {children}
        </div>

        {footer && <div className="dialog-panel__footer">{footer}</div>}
      </div>
    </div>
  );
}
