import { envs } from "./env-schema.ts";

/**
 * Pauses the execution of asynchronous operations for a specified duration.
 *
 * @param {number} ms - The duration in milliseconds to delay the execution.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Resolves and constructs a fully qualified URL for accessing an asset from the API.
 *
 * @param {string} assetPath - The relative path of the asset.
 * @returns {string} The fully qualified URL pointing to the specified asset.
 */
export const getAssetUrl = (assetPath: string): string => {
  const cleanPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return `${envs.VITE_ASSETS_BASE_URL}/${cleanPath}`;
};

/**
 * Generates the complete URL for an icon file to be accessed from API.
 *
 * This function takes the name of an icon file and returns its corresponding URL
 * by appending it to the predefined directory path for icons. The function
 * supports only `.svg` and `.png` file formats. If the given file name has an
 * unsupported format, an error is logged to the console indicating the invalid
 * file extension.
 *
 * @param {string} iconFileName - The name of the icon file, including its extension (e.g., "icon.svg" or "icon.png").
 * @returns {string} The complete URL for the icon file within the assets directory.
 */
export const getIconUrl = (iconFileName: string): string => {
  const validIconPattern = /\.(svg|png)$/i;

  if (!validIconPattern.test(iconFileName)) {
    const lastDotIndex = iconFileName.lastIndexOf(".");
    const fileExtension =
      lastDotIndex !== -1
        ? iconFileName.substring(lastDotIndex)
        : "no extension";

    console.error(
      `Invalid icon file extension. Only SVG and PNG files are supported. Received: ${fileExtension}`,
    );
  }

  return getAssetUrl(`icons/${iconFileName}`);
};

/**
 * Checks if the given value is a record (an object with string keys and unknown values).
 *
 * A value is considered a record if it:
 * - Is of type "object"
 * - Is not null
 * - Is not an array
 *
 * @param {unknown} value - The value to be checked.
 * @returns {boolean} Returns true if the value is a record, otherwise false.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
