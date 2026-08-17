import type { Category } from "../domain";
import { exportCategoryToOBF } from "./conversion";
import type { OBFBoard, OBFImage, OBFSound, OBZManifest } from "./types";
import {
  asAudioMimeType,
  asImageMimeType,
  asString,
  extensionForMimeType,
  inferAudioMimeType,
  inferImageMimeType,
  parseOBFBoard,
  parseOBZManifest,
} from "./validation";

type MediaKind = "image" | "sound";

interface MediaResourceBytes {
  bytes: Uint8Array;
  contentType: string;
}

function decodeDataUri(dataUri: string): MediaResourceBytes | undefined {
  const match = /^data:([^;,]+)[^,]*;base64,(.*)$/s.exec(dataUri);
  if (!match) return undefined;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType: match[1].toLowerCase() };
}

/** Read a media resource shipped with the app (e.g. "/boards/media/womp.gif"). */
async function fetchAppAsset(url: string): Promise<MediaResourceBytes | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const buffer = await response.arrayBuffer();
    return {
      bytes: new Uint8Array(buffer),
      contentType: response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "",
    };
  } catch {
    return undefined;
  }
}

async function resolveResourceBytes(
  resource: OBFImage | OBFSound,
): Promise<MediaResourceBytes | undefined> {
  const data = asString(resource.data);
  if (data?.startsWith("data:")) return decodeDataUri(data);

  const url = asString(resource.url);
  // Remote https resources stay as links so exports never depend on CORS.
  if (!url || url.startsWith("http")) return undefined;
  return fetchAppAsset(url);
}

function resourceFilePath(
  kind: MediaKind,
  resource: OBFImage | OBFSound,
  contentType: string,
): string {
  const url = asString(resource.url);
  const mimeType =
    kind === "image"
      ? (asImageMimeType(resource.content_type) ??
        asImageMimeType(contentType) ??
        (url ? inferImageMimeType(url) : undefined) ??
        "image/png")
      : (asAudioMimeType(resource.content_type) ??
        asAudioMimeType(contentType) ??
        (url ? inferAudioMimeType(url) : undefined) ??
        "audio/mpeg");
  const extension = extensionForMimeType(mimeType, kind === "image" ? "png" : "mp3");
  const safeId = resource.id.replace(/[^a-z0-9_-]/gi, "_");
  return `${kind === "image" ? "images" : "sounds"}/${safeId}.${extension}`;
}

/**
 * Package one or more categories as an OBZ archive (ZIP containing OBF boards,
 * their image/audio files, and a manifest.json).  Returns the zip Blob and a
 * suggested filename.
 */
export async function exportCategoriesToOBZ(
  categories: Category[],
  locale = "en",
): Promise<{ blob: Blob; filename: string }> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  const boardPaths: Record<string, string> = {};
  const imagePaths: Record<string, string> = {};
  const soundPaths: Record<string, string> = {};
  let rootPath: string | undefined;

  for (const category of categories) {
    const board = exportCategoryToOBF(category, locale);

    const resourceGroups: Array<[MediaKind, Array<OBFImage | OBFSound>, Record<string, string>]> = [
      ["image", board.images, imagePaths],
      ["sound", board.sounds, soundPaths],
    ];
    for (const [kind, resources, paths] of resourceGroups) {
      for (const resource of resources) {
        const resolved = await resolveResourceBytes(resource);
        if (!resolved) continue;
        const filePath = resourceFilePath(kind, resource, resolved.contentType);
        zip.file(filePath, resolved.bytes);
        paths[resource.id] = filePath;
        resource.content_type ??= resolved.contentType || undefined;
        resource.url = filePath;
        // The bytes now live in the archive, so drop the inline copy.
        resource.data = undefined;
      }
    }

    const safeId = category.id.replace(/[^a-z0-9_-]/gi, "_");
    const boardPath = `boards/${safeId}.obf`;
    zip.file(boardPath, JSON.stringify(board, null, 2));
    boardPaths[safeId] = boardPath;
    if (!rootPath) rootPath = boardPath;
  }

  const manifest: OBZManifest = {
    format: "open-board-0.1",
    root: rootPath,
    paths: { boards: boardPaths, images: imagePaths, sounds: soundPaths },
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
 * Locate a bundled resource inside the zip, checking multiple sources:
 *   1. Non-spec "path" key some producers add directly on the resource entry
 *   2. manifest.paths[…][id] (OBZ spec)
 *   3. resource.url when it is a relative path (not an absolute http/data URI)
 */
function zipPathForResource(
  resource: OBFImage | OBFSound,
  manifestPaths: Record<string, string>,
): { path: string; fromUrl: boolean } | undefined {
  const nonSpecPath = asString((resource as unknown as Record<string, unknown>).path);
  const resourceId = asString(resource.id);
  const manifestPath =
    resourceId && typeof manifestPaths[resourceId] === "string"
      ? manifestPaths[resourceId]
      : undefined;
  const resourceUrl = asString(resource.url);
  const relativeUrl =
    resourceUrl && !resourceUrl.startsWith("http") && !resourceUrl.startsWith("data:")
      ? resourceUrl
      : undefined;

  const path = nonSpecPath ?? manifestPath ?? relativeUrl;
  return path ? { path, fromUrl: path === relativeUrl } : undefined;
}

/**
 * Read a File as an OBZ archive and return all the OBF boards found inside.
 * Images and sounds bundled as separate files in the zip are inlined back into
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

    const resourceGroups: Array<
      [MediaKind, Array<OBFImage | OBFSound>, Record<string, string> | undefined]
    > = [
      ["image", board.images, manifest.paths.images],
      ["sound", board.sounds, manifest.paths.sounds],
    ];
    for (const [kind, resources, manifestPaths] of resourceGroups) {
      for (const resource of resources) {
        // Already a data URI — nothing to do
        if (typeof resource.data === "string" && resource.data) continue;

        const located = zipPathForResource(resource, manifestPaths ?? {});
        if (!located) continue;

        const entry = zip.file(located.path);
        if (!entry) continue;

        const contentType =
          kind === "image"
            ? (asImageMimeType(resource.content_type) ??
              inferImageMimeType(located.path) ??
              "image/png")
            : (asAudioMimeType(resource.content_type) ??
              inferAudioMimeType(located.path) ??
              "audio/mpeg");
        resource.data = `data:${contentType};base64,${await entry.async("base64")}`;
        // Clear the relative URL now that we've inlined the data
        if (located.fromUrl) resource.url = undefined;
      }
    }

    boards.push(board);
  }

  return boards;
}
