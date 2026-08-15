import type { Category, Symbol } from "../domain";
import { isImageDataUrl } from "../ui";
import { createId } from "../utils/createId";
import type { OBFBoard, OBFButton, OBFImage } from "./types";
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
  return hexMap[value.toLowerCase()];
}

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

/** Convert OBF buttons into app Symbols (for import into My Words) */
export function importOBFToSymbols(board: OBFBoard): Symbol[] {
  const images = Array.isArray(board.images) ? board.images : [];
  const buttons = Array.isArray(board.buttons) ? board.buttons : [];
  const imageMap = new Map<string, OBFImage>(
    images
      .filter((img): img is OBFImage & { id: string } => typeof img?.id === "string")
      .map((img) => [img.id, img]),
  );

  return buttons
    .map((btn): Symbol | null => {
      const label = asString(btn.label)?.trim();
      if (!label) return null;

      let emoji = "❓";
      if (btn.image_id) {
        const img = imageMap.get(btn.image_id);
        if (img) {
          const data = asString(img.data);
          const url = asString(img.url);
          if (data && isImageDataUrl(data)) {
            emoji = data;
          } else if (url?.startsWith("https://")) {
            emoji = url;
          }
        }
      }

      const vocalization = asString(btn.vocalization)?.trim();

      return {
        id: createId(`obf-${btn.id}`),
        label,
        emoji,
        speak: vocalization || undefined,
        color: colorNameFromOBF(btn.background_color),
        isCustom: true,
      };
    })
    .filter((s): s is Symbol => s !== null);
}
