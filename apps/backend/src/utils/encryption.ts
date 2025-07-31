import { ValidationError } from "./errors/validation.error.js";
import * as crypto from "node:crypto";
import { InternalServerError } from "./errors/internal-server.error.js";
import { logger } from "./logger/index.js";

const ENCRYPTION_KEY_LENGTH_BYTES = 32; //256-bits
const CIPHER_ALGORITHM: crypto.CipherGCMTypes = "aes-256-gcm";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (
  typeof ENCRYPTION_KEY !== "string" ||
  Buffer.byteLength(ENCRYPTION_KEY, "base64") !== ENCRYPTION_KEY_LENGTH_BYTES
) {
  throw new ValidationError(
    `ENCRYPTION_KEY environment variable must be set to ${ENCRYPTION_KEY_LENGTH_BYTES} Bytes (${
      ENCRYPTION_KEY_LENGTH_BYTES * 8
    }-Bit) base64 encoded string.`,
  );
}

/**
 * Encrypt data using AES
 * @param plainText - Text to encrypt
 */
export const encryptData = (plainText: string): string => {
  const iv = crypto.randomBytes(12).toString("base64");
  const cipher = crypto.createCipheriv(
    CIPHER_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "base64"),
    Buffer.from(iv, "base64"),
  );
  let cipherText = cipher.update(plainText, "utf8", "base64");
  cipherText += cipher.final("base64");
  const tag = cipher.getAuthTag().toString("base64");

  return `${cipherText}$${iv}$${tag}`;
};

/**
 * Decrypt data using AES
 * @param encryptedData - AES encrypted data
 * The data must have three base64 encoded parts separated by $ symbol i.e. ciphertext$iv$tag
 */
export const decryptData = (
  encryptedData?: string,
):
  | {
      plainText: string;
      ok: true;
    }
  | { ok: false } => {
  if (!encryptedData) {
    return {
      ok: false,
    };
  }

  const encryptedDataParts = encryptedData.split("$");

  if (encryptedDataParts.length < 3) {
    return {
      ok: false,
    };
  }

  const [cipherText, iv, tag] = encryptedDataParts;

  if (typeof cipherText !== "string" || !iv || !tag) {
    return {
      ok: false,
    };
  }

  try {
    const decipher = crypto.createDecipheriv(
      CIPHER_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "base64"),
      Buffer.from(iv, "base64"),
    );

    decipher.setAuthTag(Buffer.from(tag, "base64"));

    let plainText = decipher.update(cipherText, "base64", "utf8");
    plainText += decipher.final("utf8");

    return {
      plainText,
      ok: true,
    };
  } catch (error) {
    logger.error(
      new InternalServerError(
        error as Error,
        "Failed to decrypt data.",
      ).toJSON(),
    );
  }
  return {
    ok: false,
  };
};
