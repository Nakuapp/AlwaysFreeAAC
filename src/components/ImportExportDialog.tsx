import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Download, Upload, X } from "lucide-react";
import type { Category } from "../data/vocabulary";
import { useFocusTrap } from "../hooks/useFocusTrap";
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
import { IconVisual } from "./IconVisual";
import type { UserBoard } from "../App";
import "./ImportExportDialog.css";

interface ImportExportDialogProps {
  language: Language;
  /** All categories available for export (user boards + visible built-ins) */
  allCategories: Category[];
  onImportBoards: (boards: UserBoard[]) => void;
  onClose: () => void;
}

type ImportStatus = "idle" | "success" | "error";

function obfBoardToUserBoard(board: OBFBoard): UserBoard {
  const symbols = importOBFToSymbols(board);
  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: board.name?.trim() || "Imported Board",
    emoji: "pen-square",
    symbols,
  };
}

export function ImportExportDialog({
  language,
  allCategories,
  onImportBoards,
  onClose,
}: ImportExportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggleBoard(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(allCategories.map((c) => c.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleExport() {
    const selected = allCategories.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return;
    setIsExporting(true);
    try {
      if (selected.length === 1) {
        const board = exportCategoryToOBF(selected[0], language);
        downloadOBF(board);
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
        file.name.toLowerCase().endsWith(".obz") ||
        file.type === "application/zip";

      let obfBoards: OBFBoard[];
      if (isOBZ) {
        obfBoards = await readOBZFile(file);
      } else {
        obfBoards = [await readOBFFile(file)];
      }

      const newBoards = obfBoards
        .map(obfBoardToUserBoard)
        .filter((b) => b.symbols.length > 0);

      if (newBoards.length === 0) {
        setImportStatus("error");
        return;
      }

      onImportBoards(newBoards);
      setImportCount(newBoards.length);
      setImportStatus("success");
    } catch {
      setImportStatus("error");
    }
  }

  const selectedCount = selectedIds.size;
  const allSelected = allCategories.length > 0 && selectedCount === allCategories.length;
  const exportFormatLabel =
    selectedCount === 0
      ? t(language, "exportFormatNone")
      : selectedCount === 1
        ? t(language, "exportFormatOBF")
        : t(language, "exportFormatOBZ");

  return (
    <div
      className="ie-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t(language, "importExport")}
    >
      <div className="ie-panel" ref={panelRef}>
        <div className="ie-panel__header">
          <h2 className="ie-panel__title">{t(language, "importExport")}</h2>
          <button
            className="ie-panel__close"
            onClick={onClose}
            aria-label={t(language, "close")}
            type="button"
          >
            <X className="ie-panel__close-icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div className="ie-panel__body">
          {/* ── Export section ───────────────────────────── */}
          <section className="ie-section">
            <h3 className="ie-section__title">{t(language, "exportSection")}</h3>

            <div className="ie-board-list" role="group" aria-label={t(language, "exportBoardsLabel")}>
              {allCategories.map((cat) => {
                const checked = selectedIds.has(cat.id);
                return (
                  <label key={cat.id} className="ie-board-row">
                    <input
                      type="checkbox"
                      className="ie-board-row__checkbox"
                      checked={checked}
                      onChange={() => toggleBoard(cat.id)}
                    />
                    <IconVisual value={cat.emoji} className="ie-board-row__icon" />
                    <span className="ie-board-row__label">{cat.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="ie-select-shortcuts">
              <button
                type="button"
                className="ie-link-btn"
                onClick={allSelected ? deselectAll : selectAll}
              >
                {allSelected ? t(language, "deselectAll") : t(language, "selectAll")}
              </button>
            </div>

            <p className="ie-format-hint">{exportFormatLabel}</p>

            <button
              type="button"
              className="ie-export-btn"
              onClick={handleExport}
              disabled={selectedCount === 0 || isExporting}
            >
              <Download className="ie-export-btn__icon" aria-hidden="true" focusable="false" />
              {t(language, "exportSelected")}
            </button>
          </section>

          {/* ── Import section ───────────────────────────── */}
          <section className="ie-section">
            <h3 className="ie-section__title">{t(language, "importSection")}</h3>
            <p className="ie-format-hint">{t(language, "importBoardHint")}</p>

            <button
              type="button"
              className="ie-import-btn"
              onClick={() => {
                setImportStatus("idle");
                fileInputRef.current?.click();
              }}
            >
              <Upload className="ie-import-btn__icon" aria-hidden="true" focusable="false" />
              {t(language, "importBoard")}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".obf,.obz,application/json,application/zip"
              className="ie-file-input"
              onChange={handleImportFile}
              aria-hidden="true"
              tabIndex={-1}
            />

            {importStatus === "success" && (
              <p className="ie-status ie-status--success" role="status">
                {t(language, "importSuccess", { count: importCount })}
              </p>
            )}
            {importStatus === "error" && (
              <p className="ie-status ie-status--error" role="alert">
                {t(language, "importBoardError")}
              </p>
            )}
          </section>
        </div>

        <div className="ie-panel__footer">
          <button type="button" className="ie-panel__done" onClick={onClose}>
            {t(language, "done")}
          </button>
        </div>
      </div>
    </div>
  );
}
