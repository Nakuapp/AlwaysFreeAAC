/**
 * Utilities for the Open Board Format (OBF) v0.1
 * Specification: https://www.openboardformat.org/docs
 *
 * OBF is the standard interchange format used by the open AAC ecosystem
 * (OpenAAC / OpenBoard). Boards exported by AlwaysFreeAAC can be opened in
 * any compatible AAC application (e.g. Cboard, CommunicoTot, etc.).
 */

import type { Category, Symbol } from "../data/vocabulary";

// ── Types ─────────────────────────────────────────────────────────────────

export interface OBFImage {
  id: string;
  /** Public URL for the image */
  url?: string;
  /** Full data URI (e.g. "data:image/png;base64,…") */
  data?: string;
  content_type?: string;
  width?: number;
  height?: number;
}

export interface OBFButton {
  id: string;
  label: string;
  /** Text spoken aloud — omit if identical to label */
  vocalization?: string;
  image_id?: string;
  background_color?: string;
  border_color?: string;
}

export interface OBFGrid {
  rows: number;
  columns: number;
  order: Array<Array<string | null>>;
}

export interface OBFBoard {
  format: "open-board-0.1";
  id: string;
  locale: string;
  name: string;
  description_html?: string;
  buttons: OBFButton[];
  grid: OBFGrid;
  images: OBFImage[];
}

// ── Color mappings ─────────────────────────────────────────────────────────

/** App color name → RGBA string used in OBF background_color */
const COLOR_TO_RGBA: Record<string, string> = {
  green: "rgba(200,230,201,1)",
  blue: "rgba(187,222,251,1)",
  orange: "rgba(255,224,178,1)",
  yellow: "rgba(255,249,196,1)",
  red: "rgba(255,205,210,1)",
  purple: "rgba(225,190,231,1)",
  pink: "rgba(252,228,236,1)",
  teal: "rgba(178,223,219,1)",
  gray: "rgba(224,224,224,1)",
};

/** Reverse: OBF rgba/hex → app color name */
function colorNameFromOBF(value: string | undefined): string | undefined {
  if (!value) return undefined;
  for (const [name, rgba] of Object.entries(COLOR_TO_RGBA)) {
    if (rgba === value) return name;
  }
  // Fallback: try hex values that match our CSS variables
  const hexMap: Record<string, string> = {
    "#c8e6c9": "green",
    "#bbdefb": "blue",
    "#ffe0b2": "orange",
    "#fff9c4": "yellow",
    "#ffcdd2": "red",
    "#e1bee7": "purple",
    "#fce4ec": "pink",
    "#b2dfdb": "teal",
    "#e0e0e0": "gray",
  };
  return hexMap[value.toLowerCase()];
}

// ── Export ─────────────────────────────────────────────────────────────────

/** Convert an app Category into an OBF board object */
export function exportCategoryToOBF(category: Category, locale = "en"): OBFBoard {
  const images: OBFImage[] = [];
  const buttons: OBFButton[] = [];

  for (const symbol of category.symbols) {
    const btnId = `btn-${symbol.id}`;
    let imageId: string | undefined;

    if (symbol.emoji.startsWith("data:image/")) {
      // Custom uploaded image stored as a data URI
      const imgId = `img-${symbol.id}`;
      images.push({ id: imgId, data: symbol.emoji });
      imageId = imgId;
    } else if (symbol.emoji.startsWith("https://") || symbol.emoji.startsWith("http://")) {
      // External image URL (e.g. from OpenSymbols)
      const imgId = `img-${symbol.id}`;
      images.push({ id: imgId, url: symbol.emoji });
      imageId = imgId;
    }
    // Emoji characters and icon keys are not image resources in OBF;
    // OBF readers will display the label text.

    const button: OBFButton = {
      id: btnId,
      label: symbol.label,
    };
    if (symbol.speak && symbol.speak !== symbol.label) {
      button.vocalization = symbol.speak;
    }
    if (imageId) button.image_id = imageId;
    if (symbol.color) {
      const rgba = COLOR_TO_RGBA[symbol.color];
      if (rgba) button.background_color = rgba;
    }
    buttons.push(button);
  }

  const cols = Math.min(4, Math.max(1, buttons.length));
  const rows = Math.max(1, Math.ceil(buttons.length / cols));
  const order: Array<Array<string | null>> = [];
  for (let r = 0; r < rows; r++) {
    const row: Array<string | null> = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      row.push(idx < buttons.length ? buttons[idx].id : null);
    }
    order.push(row);
  }

  return {
    format: "open-board-0.1",
    id: category.id,
    locale,
    name: category.label,
    description_html:
      'Created with <a href="https://github.com/Nakuapp/AlwaysFreeAAC">AlwaysFreeAAC</a>',
    buttons,
    grid: { rows, columns: cols, order },
    images,
  };
}

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

// ── Import ─────────────────────────────────────────────────────────────────

/** Read a File as an OBF board, rejecting if it is not valid OBF */
export async function readOBFFile(file: File): Promise<OBFBoard> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as unknown;
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          typeof (parsed as Record<string, unknown>).format !== "string" ||
          !(
            (parsed as Record<string, unknown>).format as string
          ).startsWith("open-board")
        ) {
          reject(new Error("Not a valid OBF file"));
          return;
        }
        resolve(parsed as OBFBoard);
      } catch {
        reject(new Error("Failed to parse OBF file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/** Convert OBF buttons into app Symbols (for import into My Words) */
export function importOBFToSymbols(board: OBFBoard): Symbol[] {
  const imageMap = new Map<string, OBFImage>(
    (board.images ?? []).map((img) => [img.id, img])
  );

  return (board.buttons ?? [])
    .map((btn): Symbol | null => {
      if (!btn.label?.trim()) return null;

      let emoji = "❓";
      if (btn.image_id) {
        const img = imageMap.get(btn.image_id);
        if (img) {
          if (img.data?.startsWith("data:")) {
            emoji = img.data;
          } else if (img.url) {
            emoji = img.url;
          }
        }
      }

      return {
        id: `obf-${btn.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: btn.label.trim(),
        emoji,
        speak: btn.vocalization || undefined,
        color: colorNameFromOBF(btn.background_color),
        isCustom: true,
      };
    })
    .filter((s): s is Symbol => s !== null);
}
