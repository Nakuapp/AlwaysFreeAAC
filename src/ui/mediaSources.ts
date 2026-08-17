/** Public folder that holds media shipped with the app. */
const BUNDLED_MEDIA_DIRECTORY = "boards/media/";

/** URL for an asset shipped in `public/boards/media/`, honoring the Vite base path. */
export function bundledMediaUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}${BUNDLED_MEDIA_DIRECTORY}${fileName}`;
}

/**
 * True for same-origin asset paths such as `/boards/media/womp.gif`.
 * Protocol-relative and scheme URLs are rejected so stored values can never
 * become `javascript:` or third-party sources.
 */
export function isAppAssetPath(value: string): boolean {
  if (value.startsWith("//")) return false;
  return value.startsWith("/") || value.startsWith("./");
}
