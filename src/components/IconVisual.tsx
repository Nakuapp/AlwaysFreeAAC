import { useEffect, useState } from "react";
import { getAppIcon, getAppIconStyle, isRasterImageDataUrl, isExternalImageUrl } from "../icons";

interface IconVisualProps {
  value: string;
  className: string;
}

export function IconVisual({ value, className }: IconVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [value]);

  const isImage = isRasterImageDataUrl(value) || isExternalImageUrl(value);

  if (isImage && !imageFailed) {
    return (
      <img
        className={`${className} ${className}--img`}
        src={value}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  const Icon = getAppIcon(value);
  if (Icon) {
    const style = getAppIconStyle(value);
    return (
      <Icon
        className={className}
        aria-hidden="true"
        focusable="false"
        strokeWidth={style === "filled" ? 1.8 : 2.2}
        fill={style === "filled" ? "currentColor" : "none"}
      />
    );
  }

  return <span className={className} aria-hidden="true">{value}</span>;
}
