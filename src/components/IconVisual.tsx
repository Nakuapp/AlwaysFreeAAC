import { getAppIcon, isRasterImageDataUrl } from "../icons";

interface IconVisualProps {
  value: string;
  className: string;
}

export function IconVisual({ value, className }: IconVisualProps) {
  if (isRasterImageDataUrl(value)) {
    return <img className={`${className} ${className}--img`} src={value} alt="" draggable={false} />;
  }

  const Icon = getAppIcon(value);
  if (Icon) {
    return <Icon className={className} aria-hidden="true" focusable="false" strokeWidth={2.2} />;
  }

  return <span className={className} aria-hidden="true">{value}</span>;
}
