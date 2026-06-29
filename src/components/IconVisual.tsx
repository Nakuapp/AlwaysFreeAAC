import { getAppIcon, getAppIconStyle, isRasterImageDataUrl } from "../icons";

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
