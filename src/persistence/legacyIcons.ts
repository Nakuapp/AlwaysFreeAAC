/**
 * Boards saved before the icon picker was removed stored Lucide icon keys
 * (optionally suffixed with "-filled") in the `emoji` field. Map them to
 * emoji so previously created tiles keep rendering something meaningful.
 */
const LEGACY_ICON_EMOJI: Record<string, string> = {
  activity: "🏃",
  apple: "🍎",
  bath: "🛁",
  bed: "🛏️",
  bell: "🔔",
  "book-open": "📖",
  briefcase: "💼",
  camera: "📷",
  candy: "🍬",
  check: "✅",
  "circle-help": "❓",
  clock: "🕐",
  cloud: "☁️",
  "cloud-rain": "🌧️",
  coffee: "☕",
  cookie: "🍪",
  delete: "⌫",
  ear: "👂",
  eye: "👁️",
  "file-text": "📄",
  flag: "🏁",
  "gamepad-2": "🎮",
  gauge: "⏲️",
  globe: "🌍",
  handshake: "🤝",
  heart: "❤️",
  home: "🏠",
  hospital: "🏥",
  "ice-cream-cone": "🍦",
  "image-icon": "🖼️",
  info: "ℹ️",
  "message-circle": "💬",
  mic: "🎤",
  milk: "🥛",
  moon: "🌙",
  "moon-star": "🌙",
  music: "🎵",
  octagon: "🛑",
  "pen-square": "✏️",
  pencil: "✏️",
  pizza: "🍕",
  play: "▶️",
  plus: "➕",
  rocket: "🚀",
  sandwich: "🥪",
  school: "🏫",
  search: "🔍",
  settings: "⚙️",
  "sliders-horizontal": "🎛️",
  smile: "😊",
  snowflake: "❄️",
  soup: "🍲",
  sparkles: "✨",
  star: "⭐",
  store: "🏪",
  sun: "☀️",
  thermometer: "🌡️",
  "thumbs-down": "👎",
  "thumbs-up": "👍",
  trees: "🌳",
  turtle: "🐢",
  tv: "📺",
  type: "🔤",
  upload: "⬆️",
  users: "👨‍👩‍👧",
  "utensils-crossed": "🍽️",
  "volume-2": "🔊",
  waves: "🌊",
  x: "❌",
  zap: "⚡",
};

const FALLBACK_EMOJI = "⭐";

export function legacyIconToEmoji(value: string): string {
  const base = value.endsWith("-filled") ? value.slice(0, -"-filled".length) : value;
  const mapped = LEGACY_ICON_EMOJI[base];
  if (mapped) return mapped;
  // Unmapped bare ASCII words are stale icon keys, not emoji or image URLs.
  if (/^[a-z0-9-]+$/.test(value)) return FALLBACK_EMOJI;
  return value;
}
