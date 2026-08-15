import type { Category } from "../domain";
import { exportCategoryToOBF } from "./conversion";
import type { OBFBoard, OBZManifest } from "./types";
import {
  asImageMimeType,
  asString,
  inferImageMimeType,
  parseOBFBoard,
  parseOBZManifest,
} from "./validation";

/**
 * Package one or more categories as an OBZ archive (ZIP containing OBF boards
 * and a manifest.json).  Returns the zip Blob and a suggested filename.
 */
export async function exportCategoriesToOBZ(
  categories: Category[],
  locale = "en",
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
    format: "open-board-0.1",
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

  const manifest = parseOBZManifest(JSON.parse(await manifestFile.async("string")));
  if (!manifest) throw new Error("OBZ manifest is invalid");

  const boards: OBFBoard[] = [];

  for (const boardPath of Object.values(manifest.paths.boards)) {
    if (typeof boardPath !== "string" || !boardPath) continue;
    const boardFile = zip.file(boardPath);
    if (!boardFile) continue;

    const parsed: unknown = JSON.parse(await boardFile.async("string"));
    const board = parseOBFBoard(parsed);
    if (!board) continue;

    // Build a reverse-lookup from imageId → zip path using manifest.paths.images
    const manifestImagePaths =
      typeof manifest.paths?.images === "object" && manifest.paths.images !== null
        ? manifest.paths.images
        : {};
    const boardImages = Array.isArray(board.images) ? board.images : [];

    // Inline any bundled image files back into the board's image entries
    for (const img of boardImages) {
      // Already a data URI — nothing to do
      if (typeof img.data === "string" && img.data) continue;

      // Determine the zip-internal path for this image, checking multiple sources:
      //   1. Non-spec "path" key some producers add directly on the image entry
      //   2. manifest.paths.images[id] (OBZ spec)
      //   3. img.url when it is a relative path (not an absolute http/data URI)
      const nonSpecPath = asString((img as unknown as Record<string, unknown>).path);
      const imageId = asString(img.id);
      const manifestPath =
        imageId && typeof manifestImagePaths[imageId] === "string"
          ? manifestImagePaths[imageId]
          : undefined;
      const imageUrl = asString(img.url);
      const relativeUrl =
        imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:")
          ? imageUrl
          : undefined;

      const imgPath = nonSpecPath ?? manifestPath ?? relativeUrl;
      if (!imgPath) continue;

      const imgFile = zip.file(imgPath);
      if (!imgFile) continue;

      const contentType =
        asImageMimeType(img.content_type) ?? inferImageMimeType(imgPath) ?? "image/png";
      const b64 = await imgFile.async("base64");
      img.data = `data:${contentType};base64,${b64}`;
      // Clear the relative URL now that we've inlined the data
      if (relativeUrl) img.url = undefined;
    }

    boards.push(board);
  }

  return boards;
}
