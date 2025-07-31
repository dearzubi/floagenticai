import { Credential } from "../../../database/entities/credential.entity.js";
import { CredentialsObject } from "./types.js";
import { decryptData } from "../../../utils/encryption.js";
import { safeParseJSON } from "../../../utils/misc.js";
import { CREDENTIAL_REDACTED_VALUE } from "./constants.js";
import { logger } from "../../../utils/logger/index.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";

/**
 * Processes a credential entity and returns a formatted credential object
 * @param {Credential} credential - The credential entity to process
 * @param {boolean} unRedacted - If true, returns unredacted credential data
 * @param {true} throwIfCorrupted - If true, throws ValidationError for corrupted credentials
 * @returns {CredentialsObject} The processed credential object
 * @throws {ValidationError} When credential data is corrupted and throwIfCorrupted is true
 */
export function processCredential(
  credential: Credential,
  unRedacted?: boolean,
  throwIfCorrupted?: true,
): CredentialsObject;

/**
 * Processes a credential entity and returns a formatted credential object or undefined if corrupted
 * @param {Credential} credential - The credential entity to process
 * @param {boolean} unRedacted - If true, returns unredacted credential data
 * @param {false} throwIfCorrupted - If false, returns undefined for corrupted credentials
 * @returns {CredentialsObject | undefined} The processed credential object or undefined if corrupted
 */
export function processCredential(
  credential: Credential,
  unRedacted?: boolean,
  throwIfCorrupted?: false,
): CredentialsObject | undefined;

/**
 * Processes a credential entity and returns a formatted credential object or undefined if corrupted
 * @param {Credential} credential - The credential entity to process
 * @param {boolean} unRedacted - If true, returns unredacted credential data
 * @param {boolean} throwIfCorrupted - If true, throws ValidationError for corrupted credentials, otherwise returns undefined
 * @returns {CredentialsObject | undefined} The processed credential object or undefined if corrupted
 * @throws {ValidationError} When credential data is corrupted and throwIfCorrupted is true
 */
export function processCredential(
  credential: Credential,
  unRedacted?: boolean,
  throwIfCorrupted?: boolean,
): CredentialsObject | undefined {
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
  } satisfies CredentialsObject;
}
