import { useCallback, useRef } from "react";

/**
 * Captures the currently focused element so focus can be returned to it later.
 * Required by WCAG 2.4.3 / EN 301 549 §11.2.4.3 — after a modal dialog closes,
 * focus must return to the element that triggered it.
 */
export function useRestoreFocus() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const capture = useCallback(() => {
    // Cancel any pending restore so it does not steal focus from the newly
    // opened dialog when a second modal opens before the first has closed.
    if (pendingRef.current !== null) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
    }
    if (document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }
  }, []);

  const restore = useCallback(() => {
    // Cancel any previously scheduled restore before scheduling a new one so
    // only the latest restore runs if capture+restore are called in quick
    // succession (e.g., user opens a second dialog immediately).
    if (pendingRef.current !== null) {
      clearTimeout(pendingRef.current);
    }
    // Defer so focus restoration happens after React has flushed state updates.
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null;
      triggerRef.current?.focus();
      triggerRef.current = null;
    }, 0);
  }, []);

  return { capture, restore };
}
