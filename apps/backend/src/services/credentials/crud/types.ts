import { Credential } from "../../../database/entities/credential.entity.js";
import { NodeCredentialNames } from "common";

export type CredentialData<
  name extends string | NodeCredentialNames = NodeCredentialNames,
> = Omit<Credential, "encryptedData" | "user"> & {
  credentialName: name;
  data: Record<string, string>;
};
