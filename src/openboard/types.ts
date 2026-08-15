export interface OBFImage {
  id: string;
  /** Public URL for the image */
  url?: string;
  /** Full data URI (e.g. "data:image/png;base64,…") */
  data?: string;
  content_type?: string;
  width?: number;
  height?: number;
}

export interface OBFButton {
  id: string;
  label: string;
  /** Text spoken aloud — omit if identical to label */
  vocalization?: string;
  image_id?: string;
  background_color?: string;
  border_color?: string;
}

export interface OBFGrid {
  rows: number;
  columns: number;
  order: Array<Array<string | null>>;
}

export interface OBFBoard {
  format: "open-board-0.1";
  id: string;
  locale: string;
  name: string;
  description_html?: string;
  buttons: OBFButton[];
  grid: OBFGrid;
  images: OBFImage[];
}

export interface OBZManifest {
  format: string;
  root?: string;
  paths: {
    boards: Record<string, string>;
    images?: Record<string, string>;
    sounds?: Record<string, string>;
  };
}
