import { Credential } from "../../../database/entities/credential.entity.js";

export type CredentialsObject = Omit<Credential, "encryptedData" | "user"> & {
  data: Record<string, string>;
};
