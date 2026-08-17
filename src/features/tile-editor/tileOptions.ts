type ColorLabelKey =
  | "tileColorGreen"
  | "tileColorBlue"
  | "tileColorOrange"
  | "tileColorYellow"
  | "tileColorRed"
  | "tileColorPurple"
  | "tileColorPink"
  | "tileColorTeal"
  | "tileColorGray";

export const COLOR_OPTIONS = [
  { value: "green", bg: "#c8e6c9", labelKey: "tileColorGreen" },
  { value: "blue", bg: "#bbdefb", labelKey: "tileColorBlue" },
  { value: "orange", bg: "#ffe0b2", labelKey: "tileColorOrange" },
  { value: "yellow", bg: "#fff9c4", labelKey: "tileColorYellow" },
  { value: "red", bg: "#ffcdd2", labelKey: "tileColorRed" },
  { value: "purple", bg: "#e1bee7", labelKey: "tileColorPurple" },
  { value: "pink", bg: "#fce4ec", labelKey: "tileColorPink" },
  { value: "teal", bg: "#b2dfdb", labelKey: "tileColorTeal" },
  { value: "gray", bg: "#e0e0e0", labelKey: "tileColorGray" },
] as const satisfies ReadonlyArray<{ value: string; bg: string; labelKey: ColorLabelKey }>;

export const IMAGE_PATTERN = /^data:image\/(png|jpeg|gif|webp|bmp|avif);base64,/;
export const AUDIO_PATTERN = /^data:audio\/(mpeg|ogg|wav|mp4|webm|aac|flac);base64,/;
