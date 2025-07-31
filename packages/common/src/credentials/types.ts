import { z } from "zod/v4";
import { credentialPropertySchema, credentialSchema } from "./schemas.js";
import { credentialNames, credentialPropertyTypes } from "./constants.js";
export type NodeCredentialProperty = z.infer<typeof credentialPropertySchema>;
export interface INodeCredential extends z.infer<typeof credentialSchema> {}
export type NodeCredentialPropertyTypes =
  (typeof credentialPropertyTypes)[number];
export type NodeCredentialNames = (typeof credentialNames)[number];
