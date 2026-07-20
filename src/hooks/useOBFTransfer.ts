import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Category } from "../data/vocabulary";
import type { UserBoard } from "../types/userBoard";
import { t, type Language } from "../i18n";
import {
  exportCategoryToOBF,
  exportCategoriesToOBZ,
  downloadOBF,
  downloadOBZ,
  readOBFFile,
  readOBZFile,
  importOBFToSymbols,
  type OBFBoard,
} from "../utils/openboard";

type ImportStatus = "idle" | "success" | "error";

interface UseOBFTransferOptions {
  /** Items available for selection and export */
  items: Category[];
  language: Language;
  /**
   * Called with newly parsed boards when an import succeeds.
   * The caller decides how to merge them into application state.
   */
  onImport: (importedBoards: UserBoard[]) => void;
}

function obfBoardToUserBoard(board: OBFBoard, language: Language): UserBoard {
  const symbols = importOBFToSymbols(board);
  const boardName = typeof board.name === "string" ? board.name.trim() : "";
  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: boardName || t(language, "importedBoard"),
    emoji: "pen-square",
    symbols,
  };
}

/**
 * Shared OBF import/export state and handlers used by import/export dialogs.
 *
 * Manages checkbox selection for export, the export operation, and the file
 * import flow including status messages.
 */
export function useOBFTransfer({ items, language, onImport }: UseOBFTransferOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prune selected IDs that no longer exist in items (e.g. after a delete)
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(items.map((item) => item.id));
      const next = new Set(Array.from(prev).filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleExport() {
    const selected = items.filter((item) => selectedIds.has(item.id));
    if (selected.length === 0) return;
    setIsExporting(true);
    try {
      if (selected.length === 1) {
        downloadOBF(exportCategoryToOBF(selected[0], language));
      } else {
        const { blob, filename } = await exportCategoriesToOBZ(selected, language);
        downloadOBZ(blob, filename);
      }
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportStatus("idle");
    try {
      const isOBZ =
        file.name.toLowerCase().endsWith(".obz") || file.type === "application/zip";
      const imported = isOBZ ? await readOBZFile(file) : [await readOBFFile(file)];
      const importedBoards = imported
        .map((board) => obfBoardToUserBoard(board, language))
        .filter((board) => board.symbols.length > 0);
      if (importedBoards.length === 0) {
        setImportStatus("error");
        return;
      }
      onImport(importedBoards);
      setImportCount(importedBoards.length);
      setImportStatus("success");
    } catch {
      setImportStatus("error");
    }
  }

  function triggerImport() {
    setImportStatus("idle");
    fileInputRef.current?.click();
  }

  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const exportFormatLabel =
    selectedCount === 0
      ? t(language, "exportFormatNone")
      : selectedCount === 1
        ? t(language, "exportFormatOBF")
        : t(language, "exportFormatOBZ");

  return {
    // Selection
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    allSelected,
    selectedCount,
    // Export
    exportFormatLabel,
    isExporting,
    handleExport,
    // Import
    fileInputRef,
    importStatus,
    importCount,
    handleImportFile,
    triggerImport,
  };
}
