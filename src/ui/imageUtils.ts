export function isRasterImageDataUrl(value: string) {
  return /^data:image\/(png|jpeg|gif|webp|bmp|avif);base64,/.test(value);
}

export function isImageDataUrl(value: string) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}

/** Returns true for external https image URLs (e.g. from OpenSymbols or OBF imports) */
export function isExternalImageUrl(value: string) {
  return value.startsWith("https://");
}
