import type { OBFBoard } from "./types";

/** Trigger a browser download of an OBF JSON file */
export function downloadOBF(board: OBFBoard): void {
  const json = JSON.stringify(board, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${board.name.replace(/[^a-z0-9]/gi, "_") || "board"}.obf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Trigger a browser download of an OBZ Blob */
export function downloadOBZ(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
