/** Public folder that holds media shipped with the app. */
const BUNDLED_MEDIA_DIRECTORY = "boards/media/";

function bundledMediaPrefixes(): string[] {
  const normalizedBase = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return [
    `/${BUNDLED_MEDIA_DIRECTORY}`,
    `${normalizedBase}${BUNDLED_MEDIA_DIRECTORY}`,
    `./${BUNDLED_MEDIA_DIRECTORY}`,
    BUNDLED_MEDIA_DIRECTORY,
  ];
}

/** URL for an asset shipped in `public/boards/media/`, honoring the Vite base path. */
export function bundledMediaUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}${BUNDLED_MEDIA_DIRECTORY}${fileName}`;
}

/**
 * True for bundled media paths such as `/boards/media/womp.gif`.
 * Protocol-relative, scheme, and unrelated same-origin paths are rejected so
 * export flows only embed media shipped with the app.
 */
export function isAppAssetPath(value: string): boolean {
  if (value.startsWith("//")) return false;
  return bundledMediaPrefixes().some((prefix) => value.startsWith(prefix));
}
