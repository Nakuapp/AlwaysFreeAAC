import { useRef, useState, type ChangeEvent } from "react";
import type { Symbol, TileHeight, TileSize } from "../../data/vocabulary";
import type { AppIconName, AppIconStyle } from "../../icons";
import {
  CUSTOM_TILE_ICON_OPTIONS,
  getAppIconName,
  getAppIconStyle,
  isExternalImageUrl,
  isRasterImageDataUrl,
  toAppIconValue,
} from "../../iconUtils";
import { ICON_COLOR_OPTIONS } from "./tileOptions";

type TileDialogTab = "icon" | "style" | "media";

interface UseAddTileFormOptions {
  initialSymbol?: Symbol;
  initialLabel?: string;
  onSave: (symbol: Omit<Symbol, "id">) => void;
}

function deriveIconState(emoji: string | undefined): {
  iconMode: "icon" | "image";
  iconName: AppIconName;
  iconStyle: AppIconStyle;
  imageDataUrl: string | null;
} {
  if (emoji && (isRasterImageDataUrl(emoji) || isExternalImageUrl(emoji))) {
    return { iconMode: "image", iconName: "star", iconStyle: "outline", imageDataUrl: emoji };
  }
  if (emoji) {
    return {
      iconMode: "icon",
      iconName: getAppIconName(emoji) ?? "star",
      iconStyle: getAppIconStyle(emoji),
      imageDataUrl: null,
    };
  }
  return { iconMode: "icon", iconName: "star", iconStyle: "outline", imageDataUrl: null };
}

export function useAddTileForm({ initialSymbol, initialLabel, onSave }: UseAddTileFormOptions) {
  const initial = deriveIconState(initialSymbol?.emoji);
  const [activeTab, setActiveTab] = useState<TileDialogTab>("icon");
  const [label, setLabel] = useState(initialSymbol?.label ?? initialLabel ?? "");
  const [speakOverride, setSpeakOverride] = useState(initialSymbol?.speak ?? "");
  const [iconMode, setIconMode] = useState<"icon" | "image">(initial.iconMode);
  const [iconFilter, setIconFilter] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<AppIconName>(initial.iconName);
  const [selectedIconStyle, setSelectedIconStyle] = useState<AppIconStyle>(initial.iconStyle);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial.imageDataUrl);
  const [color, setColor] = useState(initialSymbol?.color ?? "blue");
  const [iconColor, setIconColor] = useState(initialSymbol?.iconColor ?? "");
  const [tileSize, setTileSize] = useState<TileSize | "">(initialSymbol?.tileSize ?? "");
  const [tileHeight, setTileHeight] = useState<TileHeight | "">(initialSymbol?.tileHeight ?? "");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    initialSymbol?.backgroundImage ?? null,
  );
  const [soundFile, setSoundFile] = useState<string | null>(initialSymbol?.soundFile ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  function readUploadedFile(
    event: ChangeEvent<HTMLInputElement>,
    acceptPattern: RegExp,
    onAccept: (dataUrl: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result && acceptPattern.test(result)) onAccept(result);
    };
    reader.readAsDataURL(file);
  }

  function handlePreviewSound() {
    if (!soundFile) return;
    const audio = new Audio(soundFile);
    audio.play().catch(() => {});
  }

  function handleSave() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    const icon =
      iconMode === "image" && imageDataUrl
        ? imageDataUrl
        : toAppIconValue(selectedIconName, selectedIconStyle);
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
      : toAppIconValue(selectedIconName, selectedIconStyle);
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
    selectedIconName,
    setSelectedIconName,
    selectedIconStyle,
    setSelectedIconStyle,
    imageDataUrl,
    setImageDataUrl,
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
