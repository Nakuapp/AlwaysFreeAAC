import { useCallback, useState } from "react";
import type { Symbol } from "../domain";
import type { SettingsTab } from "../features/settings";
import { useRestoreFocus } from "./useRestoreFocus";

type AppDialog =
  | { type: "settings"; tab?: SettingsTab }
  | { type: "addTile"; initialLabel?: string }
  | { type: "editTile"; symbol: Symbol }
  | null;

export function useAppDialogs() {
  const [dialog, setDialog] = useState<AppDialog>(null);
  const { capture, restore } = useRestoreFocus();

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
    setDialog({ type: "settings", tab: "boards" });
  }, [capture]);

  const closeDialog = useCallback(() => {
    setDialog(null);
    restore();
  }, [restore]);

  return {
    dialog,
    openAddTile,
    openEditTile,
    openManageBoards,
    closeDialog,
  };
}
