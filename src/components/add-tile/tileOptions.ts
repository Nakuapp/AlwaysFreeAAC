import { ICON_COLOR_HEX } from "../../colors";

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

type IconColorLabelKey =
  | "tileIconColorDefault"
  | "tileColorRed"
  | "tileColorOrange"
  | "tileColorYellow"
  | "tileColorGreen"
  | "tileColorBlue"
  | "tileColorPurple"
  | "tileColorPink"
  | "tileColorTeal"
  | "tileColorGray";

export const ICON_COLOR_OPTIONS = [
  { value: "", color: null, labelKey: "tileIconColorDefault" },
  { value: "red", color: ICON_COLOR_HEX.red, labelKey: "tileColorRed" },
  { value: "orange", color: ICON_COLOR_HEX.orange, labelKey: "tileColorOrange" },
  { value: "yellow", color: ICON_COLOR_HEX.yellow, labelKey: "tileColorYellow" },
  { value: "green", color: ICON_COLOR_HEX.green, labelKey: "tileColorGreen" },
  { value: "blue", color: ICON_COLOR_HEX.blue, labelKey: "tileColorBlue" },
  { value: "purple", color: ICON_COLOR_HEX.purple, labelKey: "tileColorPurple" },
  { value: "pink", color: ICON_COLOR_HEX.pink, labelKey: "tileColorPink" },
  { value: "teal", color: ICON_COLOR_HEX.teal, labelKey: "tileColorTeal" },
  { value: "gray", color: ICON_COLOR_HEX.gray, labelKey: "tileColorGray" },
] as const satisfies ReadonlyArray<{
  value: string;
  color: string | null;
  labelKey: IconColorLabelKey;
}>;

export const IMAGE_PATTERN = /^data:image\/(png|jpeg|gif|webp|bmp|avif);base64,/;
export const AUDIO_PATTERN = /^data:audio\/(mpeg|ogg|wav|mp4|webm|aac|flac);base64,/;
