import { isRecord } from "../utils/runtimeValidation";
import type { OBFBoard, OBFButton, OBFGrid, OBFImage, OBZManifest } from "./types";

export function parseOBFBoard(value: unknown): OBFBoard | null {
  if (!isRecord(value)) return null;
  if (typeof value.format !== "string" || !value.format.startsWith("open-board")) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") return null;
  if (!Array.isArray(value.buttons) || !value.buttons.every(isValidOBFButton)) return null;
  if (!isValidOBFGrid(value.grid)) return null;
  if (value.images !== undefined) {
    if (!Array.isArray(value.images) || !value.images.every(isValidOBFImage)) return null;
  }

  return {
    format: "open-board-0.1",
    id: value.id,
    locale: typeof value.locale === "string" ? value.locale : "en",
    name: value.name,
    description_html:
      typeof value.description_html === "string" ? value.description_html : undefined,
    buttons: value.buttons,
    grid: value.grid,
    images: value.images ?? [],
  };
}

function isValidOBFButton(value: unknown): value is OBFButton {
  return isRecord(value) && typeof value.id === "string" && typeof value.label === "string";
}

function isValidOBFImage(value: unknown): value is OBFImage {
  return isRecord(value) && typeof value.id === "string";
}

function isValidOBFGrid(value: unknown): value is OBFGrid {
  return (
    isRecord(value) &&
    Number.isInteger(value.rows) &&
    Number.isInteger(value.columns) &&
    (value.rows as number) > 0 &&
    (value.columns as number) > 0 &&
    Array.isArray(value.order) &&
    value.order.every(
      (row) => Array.isArray(row) && row.every((id) => id === null || typeof id === "string"),
    )
  );
}

function parseStringRecord(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  return Object.values(value).every((entry) => typeof entry === "string")
    ? (value as Record<string, string>)
    : null;
}

export function parseOBZManifest(value: unknown): OBZManifest | null {
  if (!isRecord(value) || typeof value.format !== "string" || !isRecord(value.paths)) {
    return null;
  }

  const boards = parseStringRecord(value.paths.boards);
  if (!boards) return null;
  const images =
    value.paths.images === undefined ? undefined : parseStringRecord(value.paths.images);
  const sounds =
    value.paths.sounds === undefined ? undefined : parseStringRecord(value.paths.sounds);
  if (images === null || sounds === null) return null;

  return {
    format: value.format,
    root: typeof value.root === "string" ? value.root : undefined,
    paths: { boards, images, sounds },
  };
}

const IMAGE_EXTENSION_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export function inferImageMimeType(path: string): string | undefined {
  const withoutQuery = path.split("?")[0];
  const ext = withoutQuery.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTENSION_TO_MIME[ext] : undefined;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function asImageMimeType(value: unknown): string | undefined {
  const mimeType = asString(value)?.trim().toLowerCase();
  return mimeType && /^image\/[a-z0-9.+-]+$/.test(mimeType) ? mimeType : undefined;
}
