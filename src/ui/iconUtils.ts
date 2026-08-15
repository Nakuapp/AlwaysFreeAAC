import type { LucideIcon } from "lucide-react";
import { APP_ICONS } from "./icons";
import type { AppIconName, AppIconStyle, IconOption } from "./icons";

const FILLED_ICON_SUFFIX = "-filled";

export const CUSTOM_TILE_ICON_OPTIONS: IconOption[] = [
  { value: "star", label: "Star", keywords: ["favorite"] },
  { value: "heart", label: "Heart", keywords: ["love"] },
  { value: "message-circle", label: "Speech Bubble", keywords: ["talk", "chat"] },
  { value: "users", label: "People", keywords: ["family", "group"] },
  { value: "home", label: "Home", keywords: ["house"] },
  { value: "school", label: "School", keywords: ["class"] },
  { value: "book-open", label: "Book", keywords: ["read", "study"] },
  { value: "mic", label: "Microphone", keywords: ["speak", "voice"] },
  { value: "volume-2", label: "Sound", keywords: ["listen", "audio"] },
  { value: "play", label: "Play", keywords: ["start"] },
  { value: "gamepad-2", label: "Game", keywords: ["fun", "play"] },
  { value: "music", label: "Music", keywords: ["song"] },
  { value: "camera", label: "Camera", keywords: ["photo", "picture"] },
  { value: "apple", label: "Apple", keywords: ["food", "fruit"] },
  { value: "pizza", label: "Pizza", keywords: ["food"] },
  { value: "milk", label: "Milk", keywords: ["drink"] },
  { value: "sandwich", label: "Sandwich", keywords: ["food"] },
  { value: "cookie", label: "Cookie", keywords: ["snack"] },
  { value: "ice-cream-cone", label: "Ice Cream", keywords: ["dessert"] },
  { value: "soup", label: "Soup", keywords: ["food"] },
  { value: "coffee", label: "Drink", keywords: ["beverage"] },
  { value: "utensils-crossed", label: "Meal", keywords: ["eat"] },
  { value: "bed", label: "Bed", keywords: ["sleep"] },
  { value: "bath", label: "Bathroom", keywords: ["wash"] },
  { value: "store", label: "Store", keywords: ["shop"] },
  { value: "hospital", label: "Hospital", keywords: ["doctor"] },
  { value: "trees", label: "Trees", keywords: ["outside", "park"] },
  { value: "waves", label: "Water", keywords: ["pool", "swim"] },
  { value: "thermometer", label: "Hot", keywords: ["warm"] },
  { value: "snowflake", label: "Cold", keywords: ["cool"] },
  { value: "sun", label: "Sunny", keywords: ["day"] },
  { value: "moon", label: "Night", keywords: ["sleep"] },
  { value: "cloud", label: "Cloudy", keywords: ["weather"] },
  { value: "cloud-rain", label: "Rainy", keywords: ["weather"] },
  { value: "turtle", label: "Slow", keywords: ["gentle"] },
  { value: "zap", label: "Fast", keywords: ["quick"] },
  { value: "check", label: "Yes", keywords: ["done", "confirm"] },
  { value: "x", label: "No", keywords: ["cancel"] },
  { value: "circle-help", label: "Help", keywords: ["question"] },
  { value: "rocket", label: "Go", keywords: ["move"] },
  { value: "thumbs-up", label: "Like", keywords: ["good"] },
  { value: "thumbs-down", label: "Dislike", keywords: ["bad"] },
  { value: "flag", label: "Done", keywords: ["finish"] },
  { value: "eye", label: "Look", keywords: ["watch"] },
  { value: "sparkles", label: "New", keywords: ["special"] },
  { value: "bell", label: "Alert", keywords: ["notice"] },
  { value: "clock", label: "Time", keywords: ["wait"] },
  { value: "pencil", label: "Write", keywords: ["draw"] },
  { value: "pen-square", label: "Edit", keywords: ["custom"] },
  { value: "briefcase", label: "Work", keywords: ["job"] },
  { value: "tv", label: "Watch", keywords: ["screen"] },
  { value: "ear", label: "Listen", keywords: ["hear"] },
  { value: "activity", label: "Action", keywords: ["move"] },
  { value: "smile", label: "Happy", keywords: ["feeling"] },
  { value: "globe", label: "World", keywords: ["language"] },
];

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

export function getAppIcon(value: string): LucideIcon | undefined {
  const key = getAppIconName(value);
  if (!key) return undefined;
  return APP_ICONS[key];
}

export function isAppIconName(value: string): value is AppIconName {
  return Object.hasOwn(APP_ICONS, value);
}

export function getAppIconName(value: string): AppIconName | undefined {
  if (isAppIconName(value)) return value;
  if (value.endsWith(FILLED_ICON_SUFFIX)) {
    const base = value.slice(0, -FILLED_ICON_SUFFIX.length);
    if (isAppIconName(base)) return base;
  }
  return undefined;
}

export function getAppIconStyle(value: string): AppIconStyle {
  return value.endsWith(FILLED_ICON_SUFFIX) ? "filled" : "outline";
}

export function toAppIconValue(name: AppIconName, style: AppIconStyle): string {
  return style === "filled" ? `${name}${FILLED_ICON_SUFFIX}` : name;
}
