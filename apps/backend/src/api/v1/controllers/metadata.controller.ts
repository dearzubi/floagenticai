import { Request, Response } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../../../../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

/**
 * Get version information only
 */
export const getVersion = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const versionData = {
      version: packageJson.version,
    };

    res.set({
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      ETag: `"${packageJson.version}"`,
    });

    return res.status(200).json({
      success: true,
      data: versionData,
      message: "Version retrieved successfully",
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve version",
      message: "An error occurred while fetching version information",
    });
  }
};
