import { Credential } from "../../../database/entities/credential.entity.js";
import { decryptData } from "../../../utils/encryption.js";
import { safeParseJSON } from "common";
import { CREDENTIAL_REDACTED_VALUE } from "./constants.js";
import { logger } from "../../../utils/logger/index.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import { CredentialData } from "./types.js";
import { ZodType } from "zod/v4";

/**
 * Processes a credential entity and returns a formatted credential object
 * @param {Credential} credential - The credential entity to process
 * @param {boolean} unRedacted - If true, returns unredacted credential data
 * @param {true} throwIfCorrupted - If true, throws ValidationError for corrupted credentials
 * @returns {CredentialData} The processed credential object
 * @throws {ValidationError} When credential data is corrupted and throwIfCorrupted is true
 */
export function processCredential(
  credential: Credential,
  unRedacted?: boolean,
  throwIfCorrupted?: true,
): CredentialData<string>;

/**
 * Processes a credential entity and returns a formatted credential object or undefined if corrupted
 * @param {Credential} credential - The credential entity to process
 * @param {boolean} unRedacted - If true, returns unredacted credential data
 * @param {false} throwIfCorrupted - If false, returns undefined for corrupted credentials
 * @returns {CredentialData | undefined} The processed credential object or undefined if corrupted
 */
export function processCredential(
  credential: Credential,
  unRedacted?: boolean,
  throwIfCorrupted?: false,
): CredentialData<string> | undefined;

/**
 * Processes a credential entity and returns a formatted credential object or undefined if corrupted
 * @param {Credential} credential - The credential entity to process
 * @param {boolean} unRedacted - If true, returns unredacted credential data
 * @param {boolean} throwIfCorrupted - If true, throws ValidationError for corrupted credentials, otherwise returns undefined
 * @returns {CredentialData | undefined} The processed credential object or undefined if corrupted
 * @throws {ValidationError} When credential data is corrupted and throwIfCorrupted is true
 */
export function processCredential(
  credential: Credential,
  unRedacted?: boolean,
  throwIfCorrupted?: boolean,
): CredentialData<string> | undefined {
  const decryptedData = decryptData(credential.encryptedData);

  if (!decryptedData) {
    if (throwIfCorrupted) {
      throw new ValidationError(
        `Credential with id ${credential.id} is corrupted`,
      );
    }
    logger.warn(`Credential with id ${credential.id} is corrupted`);
    return;
  }

  const parsedData = safeParseJSON<Record<string, string>>(
    decryptedData.ok ? decryptedData.plainText : undefined,
  );

  if (!parsedData) {
    if (throwIfCorrupted) {
      throw new ValidationError(
        `Credential with id ${credential.id} is corrupted`,
      );
    }
    logger.warn(`Credential with id ${credential.id} is corrupted`);
    return;
  }

  if (!unRedacted) {
    for (const key of Object.keys(parsedData)) {
      parsedData[key] = CREDENTIAL_REDACTED_VALUE;
    }
  }

  return {
    id: credential.id,
    name: credential.name,
    credentialName: credential.credentialName,
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
    data: parsedData,
  } satisfies CredentialData<string>;
}

export const validateCredential = <T>({
  schema,
  credential,
}: {
  credential?: CredentialData;
  schema: ZodType;
}): T => {
  const parsed = schema.safeParse(credential ?? {});
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data as T;
};
