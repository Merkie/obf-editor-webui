export interface OBFBoard {
  /**
   * The format property is explicitly set to "open-board-0.1" to ensure version compatibility [1].
   */
  format: "open-board-0.1";
  /**
   * All IDs should be strings [1].
   */
  id: string;
  /**
   *The locale [1].
   */
  locale: string;
  /**
   * Optional URL property to accommodate variations in OBF files [1].
   */
  url?: string;
  /**
   *Optional data\_url property to accommodate variations in OBF files [1].
   */
  data_url?: string;
  /**
   *The name of the board [1].
   */
  name: string;
  /**
   * Optional description\_html property to accommodate variations in OBF files [1].
   */
  description_html?: string;
  /**
   * Represents the buttons on the board [1].
   */
  buttons: OBFButton[];
  /**
   * Represents the grid layout of the board [1].
   */
  grid?: OBFGrid;
  /**
   * Represents the images used on the board [1].
   */
  images?: OBFImage[];
  /**
   * Represents the sounds used on the board.
   */
  sounds?: OBFSound[];
  /**
   * Optional license property to accommodate resources that may not have specific licensing information [2].
   */
  license?: OBFLicense;
  /**
   * Optional default layout property to accommodate variations in OBF files.
   */
  default_layout?: string;
  /**
   *  Supports multiple languages [2].
   */
  strings?: OBFStrings;
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

/**
 * Ensures that color values conform to either `rgb` or `rgba` formats.
 */
type OBFColor = string;

interface OBFButton {
  /**
   * All IDs should be strings [1].
   */
  id: string;
  /**
   * The label of the button [1].
   */
  label: string;
  /**
   * The border color of the button [1].
   */
  border_color: OBFColor;
  /**
   * The background color of the button [1].
   */
  background_color: OBFColor;
  /**
   * Specifies how buttons can link to other boards, either within the same `.obz` file or via external URLs [4, 5].
   */
  load_board?: OBFLoadBoard;
  /**
   * The id of the image used in the button [1].
   */
  image_id?: string;
  /**
   *  A `vocalization` attribute for custom pronunciations [6].
   */
  vocalization?: string;
  /**
   * Supports both single and multiple actions [7-9].
   */
  action?: string;
  /**
   * Supports both single and multiple actions [9].
   */
  actions?: string[];
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

/**
 * Flexible image definitions [1].
 */
interface OBFImage {
  /**
   * All IDs should be strings [1].
   */
  id: string;
  /**
   * The width of the image [1].
   */
  width: number;
  /**
   * The height of the image [1].
   */
  height: number;
  /**
   * Optional license property to accommodate resources that may not have specific licensing information [2].
   */
  license?: OBFLicense;
  /**
   * Optional URL property to accommodate variations in OBF files [1].
   */
  url?: string;
  /**
   * Optional data\_url property to accommodate variations in OBF files [1].
   */
  data_url?: string;
  /**
   * The content type of the image [1].
   */
  content_type: string;
  /**
   *The path to the image [5].
   */
  path?: string;
  /**
   *The image data [10].
   */
  data?: string;
  /**
   * Accommodates proprietary or licensed symbol sets, which should be handled according to their terms of use.
   */
  symbol?: OBFSymbol;
  /**
   *Whether the image is uneditable or not.
   */
  uneditable?: boolean;
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

/**
 * Accommodates proprietary or licensed symbol sets [11].
 */
interface OBFSymbol {
  /**
   *The set that the symbol belongs to.
   */
  set: string;
  /**
   * The filename of the symbol.
   */
  filename: string;
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

/**
 * External Board Linking [4, 5].
 */
interface OBFLoadBoard {
  /**
   * All IDs should be strings [1].
   */
  id?: string;
  /**
   * Optional URL property to accommodate variations in OBF files [5].
   */
  url?: string;
  /**
   * Optional data\_url property to accommodate variations in OBF files [5].
   */
  data_url?: string;
  /**
   * The path to the linked board [5].
   */
  path?: string;
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

/**
 *  The `OBFGrid` interface accurately represents the grid layout, including the possibility of null values for empty cells.
 */
interface OBFGrid {
  /**
   * The number of rows in the grid [1].
   */
  rows: number;
  /**
   * The number of columns in the grid [1].
   */
  columns: number;
  /**
   *  The order of the buttons in the grid [1].
   */
  order: (string | null)[][];
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

/**
 * Optional license property to accommodate resources that may not have specific licensing information [2].
 */
interface OBFLicense {
  /**
   * The type of license [2].
   */
  type: string;
  /**
   * URL for copyright notice [2].
   */
  Copyright_notice_url: string;
  /**
   * URL for the source [2].
   */
  source_url?: string;
  /**
   * Name of the author [2].
   */
  author_name: string;
  /**
   * URL for the author [2].
   */
  author_url: string;
  /**
   * Email of the author [2].
   */
  author_email?: string;
}

/**
 * Supports multiple languages [2].
 */
interface OBFStrings {
  [locale: string]: {
    [key: string]: string;
  };
}

/**
 *Represents the sounds used on the board.
 */
interface OBFSound {
  /**
   * All IDs should be strings [1].
   */
  id: string;
  /**
   * Optional URL property to accommodate variations in OBF files [1].
   */
  url?: string;
  /**
   * Optional data\_url property to accommodate variations in OBF files [1].
   */
  data_url?: string;
  /**
   * The content type of the sound.
   */
  content_type: string;
  /**
   *The path to the sound [5].
   */
  path?: string;
  /**
   *The sound data [10].
   */
  data?: string;
  /**
   *Whether the sound is uneditable or not.
   */
  uneditable?: boolean;
  /**
   * An index signature to allow for custom extension properties, prefixed with `ext_` [3].
   */
  [key: `ext_${string}`]: any;
}

export interface OBFManifest {
  format: string;
  root: string;
  paths: {
    images: { [key: string]: string };
    sounds: { [key: string]: string };
    boards: { [key: string]: string };
  };
}
