/**
 * Utilities for the Open Board Format (OBF) v0.1 and Open Board Zip (OBZ) v0.2
 * Specification: https://www.openboardformat.org/docs
 *
 * OBF  — single-board JSON file.
 * OBZ  — ZIP archive containing a manifest.json and one or more OBF board files.
 *
 * Boards exported by AlwaysFreeAAC can be opened in any compatible AAC
 * application (e.g. Cboard, CommunicoTot, etc.).
 */

import type { Category, Symbol } from "../data/vocabulary";
import { isRasterImageDataUrl } from "../iconUtils";

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
    } else if (symbol.emoji.startsWith("https://")) {
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
          if (isRasterImageDataUrl(img.data ?? "")) {
            emoji = img.data!;
          } else if (img.url?.startsWith("https://")) {
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

// ── OBZ (Open Board Zip) ───────────────────────────────────────────────────

export interface OBZManifest {
  format: string;
  root?: string;
  paths: {
    boards: Record<string, string>;
    images?: Record<string, string>;
    sounds?: Record<string, string>;
  };
}

/**
 * Package one or more categories as an OBZ archive (ZIP containing OBF boards
 * and a manifest.json).  Returns the zip Blob and a suggested filename.
 */
export async function exportCategoriesToOBZ(
  categories: Category[],
  locale = "en"
): Promise<{ blob: Blob; filename: string }> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  const boardPaths: Record<string, string> = {};
  let rootPath: string | undefined;

  for (const category of categories) {
    const board = exportCategoryToOBF(category, locale);
    const safeId = category.id.replace(/[^a-z0-9_-]/gi, "_");
    const boardPath = `boards/${safeId}.obf`;
    zip.file(boardPath, JSON.stringify(board, null, 2));
    boardPaths[safeId] = boardPath;
    if (!rootPath) rootPath = boardPath;
  }

  const manifest: OBZManifest = {
    format: "open-board-0.2",
    root: rootPath,
    paths: { boards: boardPaths, images: {}, sounds: {} },
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const baseName =
    categories.length === 1
      ? categories[0].label.replace(/[^a-z0-9]/gi, "_") || "board"
      : "AlwaysFreeAAC_boards";
  return { blob, filename: `${baseName}.obz` };
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

/**
 * Read a File as an OBZ archive and return all the OBF boards found inside.
 * Images that are bundled as separate files in the zip are inlined back into
 * the board as data URIs so the rest of the import pipeline can handle them.
 */
export async function readOBZFile(file: File): Promise<OBFBoard[]> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) throw new Error("OBZ has no manifest.json");

  const manifest = JSON.parse(
    await manifestFile.async("string")
  ) as OBZManifest;

  if (!manifest.paths?.boards) {
    throw new Error("OBZ manifest has no boards paths");
  }

  const boards: OBFBoard[] = [];

  for (const boardPath of Object.values(manifest.paths.boards)) {
    const boardFile = zip.file(boardPath);
    if (!boardFile) continue;

    const parsed: unknown = JSON.parse(await boardFile.async("string"));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).format !== "string" ||
      !String((parsed as Record<string, unknown>).format).startsWith("open-board")
    ) {
      continue;
    }

    const board = parsed as OBFBoard;

    // Build a reverse-lookup from imageId → zip path using manifest.paths.images
    const manifestImagePaths: Record<string, string> =
      manifest.paths?.images ?? {};

    // Inline any bundled image files back into the board's image entries
    for (const img of board.images ?? []) {
      // Already a data URI — nothing to do
      if (img.data) continue;

      // Determine the zip-internal path for this image, checking multiple sources:
      //   1. Non-spec "path" key some producers add directly on the image entry
      //   2. manifest.paths.images[id] (OBZ spec)
      //   3. img.url when it is a relative path (not an absolute http/data URI)
      const nonSpecPath = (img as unknown as Record<string, unknown>).path as
        | string
        | undefined;
      const manifestPath = manifestImagePaths[img.id];
      const relativeUrl =
        img.url && !img.url.startsWith("http") && !img.url.startsWith("data:")
          ? img.url
          : undefined;

      const imgPath = nonSpecPath ?? manifestPath ?? relativeUrl;
      if (!imgPath) continue;

      const imgFile = zip.file(imgPath);
      if (!imgFile) continue;

      const contentType = img.content_type ?? "image/png";
      const b64 = await imgFile.async("base64");
      img.data = `data:${contentType};base64,${b64}`;
      // Clear the relative URL now that we've inlined the data
      if (relativeUrl) img.url = undefined;
    }

    boards.push(board);
  }

  return boards;
}
