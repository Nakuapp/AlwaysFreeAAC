import { useRef, useState, type ChangeEvent } from "react";
import type { Symbol, TileHeight, TileSize } from "../../domain";
import { t, type Language } from "../../i18n";
import { isExternalImageUrl, isRasterImageDataUrl } from "../../ui";
import { playAudio, readFileAsDataUrl } from "../../services/browserMedia";

type TileDialogTab = "icon" | "style" | "media";
type IconMode = "emoji" | "image";

const DEFAULT_EMOJI = "⭐";

interface UseAddTileFormOptions {
  language: Language;
  initialSymbol?: Symbol;
  initialLabel?: string;
  onSave: (symbol: Omit<Symbol, "id">) => void;
  onError?: (error: Error) => void;
}

function deriveIconState(emoji: string | undefined): {
  iconMode: IconMode;
  emojiValue: string;
  imageDataUrl: string | null;
} {
  if (emoji && (isRasterImageDataUrl(emoji) || isExternalImageUrl(emoji))) {
    return { iconMode: "image", emojiValue: DEFAULT_EMOJI, imageDataUrl: emoji };
  }
  return { iconMode: "emoji", emojiValue: emoji || DEFAULT_EMOJI, imageDataUrl: null };
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
  const [iconMode, setIconMode] = useState<IconMode>(initial.iconMode);
  const [emojiValue, setEmojiValue] = useState(initial.emojiValue);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial.imageDataUrl);
  const [color, setColor] = useState(initialSymbol?.color ?? "blue");
  const [textColor, setTextColor] = useState(initialSymbol?.textColor ?? "");
  const [hideLabel, setHideLabel] = useState(initialSymbol?.hideLabel ?? false);
  const [hideIcon, setHideIcon] = useState(initialSymbol?.hideIcon ?? false);
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

  const previewIcon = iconMode === "image" && imageDataUrl ? imageDataUrl : emojiValue;

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;

    onSave({
      label: trimmedLabel,
      emoji: previewIcon,
      speak: speakOverride.trim() || undefined,
      color,
      textColor: textColor || undefined,
      hideLabel: hideLabel || undefined,
      hideIcon: hideIcon || undefined,
      tileSize: tileSize || undefined,
      tileHeight: tileHeight || undefined,
      backgroundImage: backgroundImage ?? undefined,
      soundFile: soundFile ?? undefined,
      isCustom: true,
    });
  }

  const isValid =
    label.trim().length > 0 &&
    (iconMode === "image" ? imageDataUrl !== null : emojiValue.length > 0);

  return {
    activeTab,
    setActiveTab,
    label,
    setLabel,
    speakOverride,
    setSpeakOverride,
    iconMode,
    setIconMode,
    emojiValue,
    setEmojiValue,
    imageDataUrl,
    setImageDataUrl,
    color,
    setColor,
    textColor,
    setTextColor,
    hideLabel,
    setHideLabel,
    hideIcon,
    setHideIcon,
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
    isValid,
    previewIcon,
    readUploadedFile,
    handlePreviewSound,
    handleSave,
  };
}

export type AddTileForm = ReturnType<typeof useAddTileForm>;
