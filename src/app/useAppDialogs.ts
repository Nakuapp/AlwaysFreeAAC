import { useCallback, useState } from "react";
import type { Symbol } from "../domain";
import { useRestoreFocus } from "./useRestoreFocus";

type AppDialog =
  | { type: "settings" }
  | { type: "addTile"; initialLabel?: string }
  | { type: "editTile"; symbol: Symbol }
  | { type: "manageBoards" }
  | null;

export function useAppDialogs() {
  const [dialog, setDialog] = useState<AppDialog>(null);
  const { capture, restore } = useRestoreFocus();

  const openSettings = useCallback(() => {
    capture();
    setDialog({ type: "settings" });
  }, [capture]);

  const openAddTile = useCallback(
    (initialLabel?: string) => {
      capture();
      setDialog({ type: "addTile", initialLabel });
    },
    [capture],
  );

  const openEditTile = useCallback(
    (symbol: Symbol) => {
      capture();
      setDialog({ type: "editTile", symbol });
    },
    [capture],
  );

  const openManageBoards = useCallback(() => {
    capture();
    setDialog({ type: "manageBoards" });
  }, [capture]);

  const closeDialog = useCallback(() => {
    setDialog(null);
    restore();
  }, [restore]);

  return {
    dialog,
    openSettings,
    openAddTile,
    openEditTile,
    openManageBoards,
    closeDialog,
  };
}
