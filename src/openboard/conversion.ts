import type { Category, Symbol } from "../domain";
import { isAppAssetPath, isImageDataUrl } from "../ui";
import { createId } from "../utils/createId";
import type { OBFBoard, OBFButton, OBFImage, OBFSound } from "./types";
import { asString } from "./validation";

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
function colorNameFromOBF(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
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
  return hexMap[value.toLowerCase()] ?? (/^(#|rgba?\()/i.test(value) ? value : undefined);
}

/** Media the app can package: inline data URIs, https links, or bundled asset paths. */
function isExportableMedia(value: string | undefined): value is string {
  if (!value) return false;
  return value.startsWith("data:") || value.startsWith("https://") || isAppAssetPath(value);
}

function toImageResource(id: string, value: string | undefined): OBFImage | undefined {
  if (!isExportableMedia(value)) return undefined;
  return value.startsWith("data:") ? { id, data: value } : { id, url: value };
}

function toSoundResource(id: string, value: string | undefined): OBFSound | undefined {
  if (!isExportableMedia(value)) return undefined;
  return value.startsWith("data:") ? { id, data: value } : { id, url: value };
}

/** True when a category has image or audio files that must travel with the board. */
export function categoryHasMedia(category: Category): boolean {
  return category.symbols.some(
    (symbol) =>
      isExportableMedia(symbol.emoji) ||
      isExportableMedia(symbol.backgroundImage) ||
      isExportableMedia(symbol.soundFile),
  );
}

/** Convert an app Category into an OBF board object */
export function exportCategoryToOBF(category: Category, locale = "en"): OBFBoard {
  const images: OBFImage[] = [];
  const sounds: OBFSound[] = [];
  const buttons: OBFButton[] = [];

  for (const symbol of category.symbols) {
    const btnId = `btn-${symbol.id}`;

    const iconImage = toImageResource(`img-${symbol.id}`, symbol.emoji);
    if (iconImage) images.push(iconImage);
    const backgroundImage = toImageResource(`bg-${symbol.id}`, symbol.backgroundImage);
    if (backgroundImage) images.push(backgroundImage);
    const sound = toSoundResource(`snd-${symbol.id}`, symbol.soundFile);
    if (sound) sounds.push(sound);
    // Emoji characters are not image resources in OBF;
    // OBF readers will display the label text.

    const button: OBFButton = {
      id: btnId,
      label: symbol.label,
    };
    if (symbol.speak && symbol.speak !== symbol.label) {
      button.vocalization = symbol.speak;
    }
    if (iconImage) button.image_id = iconImage.id;
    if (backgroundImage) button.ext_alwaysfreeaac_background_image_id = backgroundImage.id;
    if (sound) button.sound_id = sound.id;
    const backgroundColor = symbol.color
      ? (COLOR_TO_RGBA[symbol.color] ?? symbol.color)
      : undefined;
    if (backgroundColor) button.background_color = backgroundColor;
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
    sounds,
  };
}

/** Convert OBF buttons into app Symbols (for import into My Words) */
export function importOBFToSymbols(board: OBFBoard): Symbol[] {
  const images = Array.isArray(board.images) ? board.images : [];
  const sounds = Array.isArray(board.sounds) ? board.sounds : [];
  const buttons = Array.isArray(board.buttons) ? board.buttons : [];
  const imageMap = new Map<string, OBFImage>(
    images
      .filter((img): img is OBFImage & { id: string } => typeof img?.id === "string")
      .map((img) => [img.id, img]),
  );
  const soundMap = new Map<string, OBFSound>(
    sounds
      .filter((snd): snd is OBFSound & { id: string } => typeof snd?.id === "string")
      .map((snd) => [snd.id, snd]),
  );

  return buttons
    .map((btn): Symbol | null => {
      const label = asString(btn.label)?.trim();
      if (!label) return null;

      const emoji = resolveImageSource(imageMap.get(btn.image_id ?? "")) ?? "❓";
      const backgroundImage = resolveImageSource(
        imageMap.get(btn.ext_alwaysfreeaac_background_image_id ?? ""),
      );
      const soundFile = resolveAudioSource(soundMap.get(btn.sound_id ?? ""));

      const vocalization = asString(btn.vocalization)?.trim();

      return {
        id: createId(`obf-${btn.id}`),
        label,
        emoji,
        speak: vocalization || undefined,
        color: colorNameFromOBF(btn.background_color),
        // Background-image tiles render the artwork on its own.
        hideLabel: backgroundImage ? true : undefined,
        hideIcon: backgroundImage ? true : undefined,
        backgroundImage,
        soundFile,
        isCustom: true,
      };
    })
    .filter((s): s is Symbol => s !== null);
}

function resolveImageSource(image: OBFImage | undefined): string | undefined {
  if (!image) return undefined;
  const data = asString(image.data);
  if (data && isImageDataUrl(data)) return data;
  const url = asString(image.url);
  return url?.startsWith("https://") ? url : undefined;
}

function resolveAudioSource(sound: OBFSound | undefined): string | undefined {
  if (!sound) return undefined;
  const data = asString(sound.data);
  if (data?.startsWith("data:audio/")) return data;
  const url = asString(sound.url);
  return url?.startsWith("https://") ? url : undefined;
}
