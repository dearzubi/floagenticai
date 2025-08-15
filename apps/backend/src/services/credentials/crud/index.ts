import { v4 as uuidv4 } from "uuid";
import { decryptData, encryptData } from "../../../utils/encryption.js";
import { User } from "../../../database/entities/user.entity.js";
import { getDB } from "../../../database/init.js";
import { NotFoundError } from "../../../utils/errors/notfound.error.js";
import { FilterQuery } from "@mikro-orm/core";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import {
  CreateCredentialAPIRequestData,
  UpdateCredentialAPIRequestData,
} from "../../../api/v1/schemas/credential.schemas.js";
import { Credential } from "../../../database/entities/credential.entity.js";
import { safeParseJSON } from "../../../utils/misc.js";
import { CREDENTIAL_REDACTED_VALUE } from "./constants.js";
import { processCredential } from "./util.js";
import { CredentialData } from "./types.js";

/**
 * Creates a new credential and saves it to the database. The data is encrypted to ensure privacy.
 *
 * @param {CreateCredentialAPIRequestData["body"]} data - The body data required to create the credential.
 * @param {User} user - The user entity associated with this credential creation.
 * @returns {Promise<Credential>} A promise that resolves to the newly created credential entity.
 */
export const createCredential = async (
  data: CreateCredentialAPIRequestData["body"],
  user: User,
): Promise<CredentialData<string>> => {
  const db = await getDB();

  const credential = db.create(Credential, {
    id: uuidv4(),
    name: data.name,
    credentialName: data.credentialName,
    encryptedData: encryptData(JSON.stringify(data.data)),
    user: user,
  });
  await db.flush();

  for (const key of Object.keys(data.data)) {
    data.data[key] = CREDENTIAL_REDACTED_VALUE;
  }

  return {
    id: credential.id,
    name: credential.name,
    credentialName: credential.credentialName,
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
    data: data.data,
  };
};

/**
 * Retrieves a credential from the database by its unique identifier. Optionally,
 * it ensures that the credential belongs to a specific user if a user ID is provided.
 * The credentials's data is decrypted before being returned and by default redacted.
 *
 * @param {string} credentialId - The unique identifier of the credential.
 * @param {string} [userId] - An optional user ID to verify ownership of the credential.
 * @param {boolean} unRedacted - An optional flag to return unredacted credentials in plain text. (Be cautious)
 * @returns {Promise<CredentialData>} A promise that resolves to the credential object.
 * @throws {NotFoundError} If no credential with the specified ID is found.
 * @throws {ValidationError} If the credential data cannot be successfully decrypted.
 */
export const getCredential = async (
  credentialId: string,
  userId?: string,
  unRedacted?: boolean,
): Promise<CredentialData<string>> => {
  const db = await getDB();

  const where: FilterQuery<Credential> = userId
    ? {
        id: credentialId,
        user: userId,
      }
    : {
        id: credentialId,
      };

  const credential = await db.findOne(Credential, where);
  if (!credential) {
    throw new NotFoundError(`Credential with id ${credentialId} not found`);
  }

  return processCredential(credential, unRedacted, true);
};

/**
 * Retrieves the list of credentials associated with a specific user.
 *
 * @param {string} userId - The unique identifier of the user whose credentials are being retrieved.
 * @param {boolean} unRedacted - An optional flag to return unredacted credentials in plain text. (Be cautious)
 * @returns {Promise<CredentialData[]>} A promise that resolves to an array of CredentialData objects associated with the user.
 */
//TODO: Paginate response
export const getCredentialList = async (
  userId: string,
  unRedacted?: boolean,
): Promise<CredentialData<string>[]> => {
  const db = await getDB();

  const credentials = await db.find(Credential, {
    user: userId,
  });

  return credentials
    .map((credential) => processCredential(credential, unRedacted, false))
    .filter(Boolean) as CredentialData<string>[];
};

/**
 * Retrieves the list of credentials associated with a specific user by credential IDs.
 *
 * @param {string[]} credentialIds - List of credential IDs
 * @param {boolean} unRedacted - An optional flag to return unredacted credentials in plain text. (Be cautious)
 * @returns {Promise<CredentialData[]>} A promise that resolves to an array of CredentialData objects associated with the user.
 */
export const getCredentialListByIds = async (
  credentialIds: string[],
  unRedacted?: boolean,
): Promise<CredentialData<string>[]> => {
  if (!credentialIds.length) {
    return [];
  }

  const db = await getDB();

  const credentials = await db.find(Credential, {
    id: { $in: credentialIds },
  });

  return credentials
    .map((credential) => processCredential(credential, unRedacted, false))
    .filter(Boolean) as CredentialData<string>[];
};

/**
 * Retrieves credentials by their credentialName field. Accepts a comma-separated list of credentialNames
 * and returns all matching credentials for the specified user.
 *
 * @param {string} credentialNames - Comma-separated list of credentialName values to search for
 * @param {string} userId - The unique identifier of the user whose credentials are being retrieved
 * @param {boolean} unRedacted - An optional flag to return unredacted credentials in plain text. (Be cautious)
 * @returns {Promise<CredentialData[]>} A promise that resolves to an array of CredentialData objects matching the credentialNames
 */
export const getCredentialsByCredentialNames = async (
  credentialNames: string,
  userId: string,
  unRedacted?: boolean,
): Promise<CredentialData<string>[]> => {
  const db = await getDB();

  // Parse comma-separated credentialNames and trim whitespace
  const credentialNamesList = credentialNames
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (credentialNamesList.length === 0) {
    return [];
  }

  const credentials = await db.find(Credential, {
    user: userId,
    credentialName: { $in: credentialNamesList },
  });

  return credentials
    .map((credential) => processCredential(credential, unRedacted, false))
    .filter(Boolean) as CredentialData<string>[];
};

/**
 * Updates an existing credential with the provided data in the database.
 *
 * @param {string} credentialId - The unique identifier of the credential to be updated.
 * @param {UpdateCredentialAPIRequestData["body"]} data - Contains the updated values for the credential including name and data fields.
 * @param {User} user - The user entity associated with the credential.
 * @returns {Promise<CredentialData>} A promise that resolves to the updated credential object.
 * @throws {NotFoundError} If the credential with the specified ID is not found or the requesting user does not have the necessary permissions to access it.
 */
export const updateCredential = async (
  credentialId: string,
  data: UpdateCredentialAPIRequestData["body"],
  user: User,
): Promise<CredentialData<string>> => {
  const db = await getDB();

  return await db.transactional(async (em) => {
    const credential = await em.findOne(Credential, {
      id: credentialId,
      user: user.id,
    });

    if (!credential) {
      throw new NotFoundError(
        `Credential with id ${credentialId} not found or you don't have permission to update it`,
      );
    }

    const decryptedData = decryptData(credential.encryptedData);
    if (!decryptedData.ok) {
      throw new ValidationError(
        `Credential with id ${credentialId} is corrupted`,
      );
    }

    const existingData = safeParseJSON<Record<string, string>>(
      decryptedData.plainText,
    );
    if (!existingData) {
      throw new ValidationError(
        `Credential with id ${credentialId} is corrupted`,
      );
    }

    if (
      data.name &&
      data.name !== credential.name &&
      data.name.trim().length > 0
    ) {
      credential.name = data.name.trim();
    }

    const dataUpdates: Record<string, string> = {};
    Object.entries(data.data).forEach(([key, value]) => {
      if (value.trim() !== CREDENTIAL_REDACTED_VALUE) {
        dataUpdates[key] = value;
      }
    });

    const updatedData = {
      ...existingData,
      ...dataUpdates,
    };

    credential.encryptedData = encryptData(JSON.stringify(updatedData));

    em.persist(credential);
    await em.flush();

    for (const key of Object.keys(updatedData)) {
      updatedData[key] = CREDENTIAL_REDACTED_VALUE;
    }

    return {
      id: credential.id,
      name: credential.name,
      credentialName: credential.credentialName,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
      data: updatedData,
    };
  });
};

/**
 * Deletes a specific credential by its ID if the user has permission to delete it.
 *
 * @param {string} credentialId - The unique identifier of the credential to be deleted.
 * @param {User} user - The user who is attempting to delete the credential; used to validate permissions.
 * @returns {Promise<void>} Resolves when the credential has been successfully deleted.
 * @throws {NotFoundError} Throws an error if the credential is not found or the user lacks permission to delete it.
 */
export const deleteCredential = async (
  credentialId: string,
  user: User,
): Promise<void> => {
  const db = await getDB();

  await db.transactional(async (em) => {
    const credential = await em.findOne(Credential, {
      id: credentialId,
      user: user.id,
    });

    if (!credential) {
      throw new NotFoundError(
        `Credential with id ${credentialId} not found or you don't have permission to delete it`,
      );
    }

    await em.remove(credential).flush();
  });
};
