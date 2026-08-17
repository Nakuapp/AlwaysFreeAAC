import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Category, UserBoard } from "../../domain";
import { t, type Language } from "../../i18n";
import { createId } from "../../utils/createId";
import {
  categoryHasMedia,
  exportCategoryToOBF,
  exportCategoriesToOBZ,
  downloadOBF,
  downloadOBZ,
  readOBFFile,
  readOBZFile,
  importOBFToSymbols,
  type OBFBoard,
} from "../../openboard";

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
  onExportError?: (error: Error) => void;
}

/**
 * A lone board without media fits in a single .obf; anything else needs the
 * .obz archive so images and sounds travel with the board.
 */
function requiresArchive(selected: Category[]): boolean {
  return selected.length > 1 || selected.some(categoryHasMedia);
}

function obfBoardToUserBoard(board: OBFBoard, language: Language): UserBoard {
  const symbols = importOBFToSymbols(board);
  const boardName = typeof board.name === "string" ? board.name.trim() : "";
  return {
    id: createId("import"),
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
export function useOBFTransfer({
  items,
  language,
  onImport,
  onExportError,
}: UseOBFTransferOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importCount, setImportCount] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
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
      if (requiresArchive(selected)) {
        const { blob, filename } = await exportCategoriesToOBZ(selected, language);
        downloadOBZ(blob, filename);
      } else {
        downloadOBF(exportCategoryToOBF(selected[0], language));
      }
    } catch (error) {
      onExportError?.(error instanceof Error ? error : new Error("Board export failed."));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportStatus("idle");
    setImportError(null);
    try {
      const isOBZ = file.name.toLowerCase().endsWith(".obz") || file.type === "application/zip";
      const imported = isOBZ ? await readOBZFile(file) : [await readOBFFile(file)];
      const importedBoards = imported
        .map((board) => obfBoardToUserBoard(board, language))
        .filter((board) => board.symbols.length > 0);
      if (importedBoards.length === 0) {
        setImportStatus("error");
        setImportError("The imported file did not contain any usable tiles.");
        return;
      }
      onImport(importedBoards);
      setImportCount(importedBoards.length);
      setImportStatus("success");
    } catch (error) {
      setImportStatus("error");
      setImportError(error instanceof Error ? error.message : "The file could not be read.");
    }
  }

  function triggerImport() {
    setImportStatus("idle");
    setImportError(null);
    fileInputRef.current?.click();
  }

  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const exportFormatLabel =
    selectedCount === 0
      ? t(language, "exportFormatNone")
      : requiresArchive(items.filter((item) => selectedIds.has(item.id)))
        ? t(language, "exportFormatOBZ")
        : t(language, "exportFormatOBF");

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
    importError,
    handleImportFile,
    triggerImport,
  };
}
