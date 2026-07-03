import { useCallback, useRef } from "react";

/**
 * Captures the currently focused element so focus can be returned to it later.
 * Required by WCAG 2.4.3 / EN 301 549 §11.2.4.3 — after a modal dialog closes,
 * focus must return to the element that triggered it.
 */
export function useRestoreFocus() {
  const triggerRef = useRef<HTMLElement | null>(null);

  const capture = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }
  }, []);

  const restore = useCallback(() => {
    // Defer so focus restoration happens after React has flushed state updates.
    setTimeout(() => {
      triggerRef.current?.focus();
      triggerRef.current = null;
    }, 0);
  }, []);

  return { capture, restore };
}
