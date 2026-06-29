/**
 * OpenSymbols API client
 * https://www.opensymbols.org/
 *
 * OpenSymbols is a free, open collection of AAC pictographic symbols
 * aggregated from ARASAAC, Mulberry, Sclera and other open libraries.
 *
 * API documentation: https://www.opensymbols.org/api
 *
 * To use a registered access token (for higher rate limits), set the
 * environment variable VITE_OPENSYMBOLS_TOKEN in your .env.local file.
 * Leave it unset to use the public unauthenticated endpoint.
 */

export interface OpenSymbolResult {
  id: string;
  name: string;
  image_url: string;
  /** Source library key, e.g. "arasaac", "mulberry", "sclera" */
  repo_key: string;
  license: string;
  license_url: string;
  author?: string;
  author_url?: string;
}

const BASE_URL = "https://www.opensymbols.org/api/v1/symbols";

/** Fetch symbols matching `keyword` from the OpenSymbols public API */
export async function searchOpenSymbols(
  keyword: string,
  signal?: AbortSignal
): Promise<OpenSymbolResult[]> {
  if (!keyword.trim()) return [];

  const url = new URL(BASE_URL);
  url.searchParams.set("q", keyword.trim());
  url.searchParams.set("per_page", "30");

  // Optional access token – set VITE_OPENSYMBOLS_TOKEN in .env.local
  const token = import.meta.env.VITE_OPENSYMBOLS_TOKEN as string | undefined;
  if (token) url.searchParams.set("access_token", token);

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`OpenSymbols API error: ${res.status}`);

  const data = await res.json() as unknown;
  if (!Array.isArray(data)) throw new Error("Unexpected OpenSymbols response");

  return (data as Record<string, unknown>[]).map((item) => ({
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    image_url: String(item.image_url ?? ""),
    repo_key: String(item.repo_key ?? ""),
    license: String(item.license ?? ""),
    license_url: String(item.license_url ?? ""),
    author: item.author ? String(item.author) : undefined,
    author_url: item.author_url ? String(item.author_url) : undefined,
  }));
}
