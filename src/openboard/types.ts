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

export interface OBFSound {
  id: string;
  /** Public URL for the audio clip */
  url?: string;
  /** Full data URI (e.g. "data:audio/mpeg;base64,…") */
  data?: string;
  content_type?: string;
  duration?: number;
}

export interface OBFButton {
  id: string;
  label: string;
  /** Text spoken aloud — omit if identical to label */
  vocalization?: string;
  image_id?: string;
  sound_id?: string;
  background_color?: string;
  border_color?: string;
  /** Non-spec: image drawn behind the tile icon and label */
  ext_alwaysfreeaac_background_image_id?: string;
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
  sounds: OBFSound[];
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
