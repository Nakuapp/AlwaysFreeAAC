import { useRef, useState, type ChangeEvent } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import type { Symbol, TileHeight, TileSize } from "../../domain";
import { t, type Language } from "../../i18n";
import type { AppIconName, AppIconStyle } from "../../ui";
import {
  CUSTOM_TILE_ICON_OPTIONS,
  getAppIconName,
  getAppIconStyle,
  isExternalImageUrl,
  isRasterImageDataUrl,
  toAppIconValue,
} from "../../ui";
import { playAudio, readFileAsDataUrl } from "../../services/browserMedia";
import { ICON_COLOR_OPTIONS } from "./tileOptions";

type TileDialogTab = "icon" | "style" | "media";

interface UseAddTileFormOptions {
  language: Language;
  initialSymbol?: Symbol;
  initialLabel?: string;
  onSave: (symbol: Omit<Symbol, "id">) => void;
  onError?: (error: Error) => void;
}

function deriveIconState(emoji: EmojiClickData | string | undefined): {
  iconMode: "emojiPicker" | "icon" | "image";
  iconName: AppIconName | string;
  iconStyle?: AppIconStyle | string;
  imageDataUrl: string | null;
  rawIconValue: string | null;
} {
  if (emoji) {
    // Test if emoji is EmojiClickData type
    if (typeof emoji === "object" && "emoji" in emoji) {
      const iconName = getAppIconName(emoji.emoji);
      return {
        iconMode: "emojiPicker",
        iconName: iconName ?? "1f44d",
        iconStyle: emoji.activeSkinTone,
        imageDataUrl: emoji.imageUrl ?? null,
        rawIconValue: emoji.emoji ?? null,
      };
    }
    if (typeof emoji === "string") {
      if (isRasterImageDataUrl(emoji) || isExternalImageUrl(emoji)) {
        return {
          iconMode: "image",
          iconName: "star",
          iconStyle: "outline",
          imageDataUrl: emoji,
          rawIconValue: null,
        };
      }

      const iconName = getAppIconName(emoji);
      return {
        iconMode: "icon",
        iconName: iconName ?? "star",
        iconStyle: getAppIconStyle(emoji),
        imageDataUrl: null,
        rawIconValue: iconName ? null : emoji,
      };
    }
  }
  return {
    iconMode: "emojiPicker",
    iconName: "star",
    iconStyle: "outline",
    imageDataUrl: null,
    rawIconValue: null,
  };
}

export function useAddTileForm({
  language,
  initialSymbol,
  initialLabel,
  onSave,
  onError,
}: UseAddTileFormOptions) {
  const initial = deriveIconState(initialSymbol?.emoji);
  const [activeTab, setActiveTab] = useState<TileDialogTab>("icon");
  const [label, setLabel] = useState(initialSymbol?.label ?? initialLabel ?? "");
  const [speakOverride, setSpeakOverride] = useState(initialSymbol?.speak ?? "");
  const [iconMode, setIconMode] = useState<"emojiPicker" | "icon" | "image">(initial.iconMode);
  const [iconFilter, setIconFilter] = useState("");
  const [selectedEmojiName, setSelectedEmojiName] = useState<EmojiClickData | null>(null);
  const [selectedIconName, setSelectedIconName] = useState<AppIconName>(initial.iconName);
  const [selectedIconStyle, setSelectedIconStyle] = useState<AppIconStyle>(initial.iconStyle);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial.imageDataUrl);
  const [rawIconValue, setRawIconValue] = useState<string | null>(initial.rawIconValue);
  const [color, setColor] = useState(initialSymbol?.color ?? "blue");
  const [iconColor, setIconColor] = useState(initialSymbol?.iconColor ?? "");
  const [tileSize, setTileSize] = useState<TileSize | "">(initialSymbol?.tileSize ?? "");
  const [tileHeight, setTileHeight] = useState<TileHeight | "">(initialSymbol?.tileHeight ?? "");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    initialSymbol?.backgroundImage ?? null,
  );
  const [soundFile, setSoundFile] = useState<string | null>(initialSymbol?.soundFile ?? null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  async function readUploadedFile(
    event: ChangeEvent<HTMLInputElement>,
    acceptPattern: RegExp,
    onAccept: (dataUrl: string) => void,
    maxBytes = 1_500_000,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > maxBytes) {
      setMediaError(t(language, "mediaFileTooLarge"));
      return;
    }
    try {
      onAccept(await readFileAsDataUrl(file, acceptPattern));
      setMediaError(null);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("File upload failed."));
    }
  }

  function handlePreviewSound() {
    if (!soundFile) return;
    void playAudio(soundFile).catch((error) =>
      onError?.(error instanceof Error ? error : new Error("Audio preview failed.")),
    );
  }

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;

    const icon =
      iconMode === "emojiPicker"
        ? selectedEmojiName
        : iconMode === "image" && imageDataUrl
          ? imageDataUrl
          : (rawIconValue ?? toAppIconValue(selectedIconName, selectedIconStyle));

    onSave({
      label: trimmedLabel,
      emoji: icon,
      speak: speakOverride.trim() || undefined,
      color,
      iconColor: iconColor || undefined,
      tileSize: tileSize || undefined,
      tileHeight: tileHeight || undefined,
      backgroundImage: backgroundImage ?? undefined,
      soundFile: soundFile ?? undefined,
      isCustom: true,
    });
  }

  const normalizedIconFilter = iconFilter.trim().toLowerCase();
  const filteredIcons = normalizedIconFilter
    ? CUSTOM_TILE_ICON_OPTIONS.filter(
        (icon) =>
          icon.label.toLowerCase().includes(normalizedIconFilter) ||
          icon.value.toLowerCase().includes(normalizedIconFilter) ||
          icon.keywords.some((keyword) => keyword.includes(normalizedIconFilter)),
      )
    : CUSTOM_TILE_ICON_OPTIONS;
  const isValid =
    label.trim().length > 0 &&
    (iconMode === "icon" ? Boolean(selectedIconName) : imageDataUrl !== null);
  const previewIcon =
    iconMode === "image" && imageDataUrl
      ? imageDataUrl
      : (rawIconValue ?? toAppIconValue(selectedIconName, selectedIconStyle));
  const previewIconColor = iconColor
    ? (ICON_COLOR_OPTIONS.find((option) => option.value === iconColor)?.color ?? undefined)
    : undefined;

  return {
    activeTab,
    setActiveTab,
    label,
    setLabel,
    speakOverride,
    setSpeakOverride,
    iconMode,
    setIconMode,
    iconFilter,
    setIconFilter,
    selectedEmojiName,
    setSelectedEmojiName,
    selectedIconName,
    setSelectedIconName,
    selectedIconStyle,
    setSelectedIconStyle,
    imageDataUrl,
    setImageDataUrl,
    rawIconValue,
    setRawIconValue,
    color,
    setColor,
    iconColor,
    setIconColor,
    tileSize,
    setTileSize,
    tileHeight,
    setTileHeight,
    backgroundImage,
    setBackgroundImage,
    soundFile,
    setSoundFile,
    mediaError,
    setMediaError,
    fileInputRef,
    bgImageInputRef,
    soundInputRef,
    labelInputRef,
    filteredIcons,
    isValid,
    previewIcon,
    previewIconColor,
    readUploadedFile,
    handlePreviewSound,
    handleSave,
  };
}

export type AddTileForm = ReturnType<typeof useAddTileForm>;
