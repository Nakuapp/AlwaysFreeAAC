import { useEffect, useState } from "react";
import { isImageDataUrl, isExternalImageUrl } from "../../ui";

interface SymbolVisualProps {
  value: string;
  className: string;
}

export function SymbolVisual({ value, className }: SymbolVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [value]);

  const isImage = isImageDataUrl(value) || isExternalImageUrl(value);

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

  return (
    <span className={className} aria-hidden="true">
      {isImage ? "🖼️" : value}
    </span>
  );
}
