import { z } from "zod/v4";
import { credentialSchema } from "common";

export const allCredentialDefinitionsListAPIResponseSchema =
  z.array(credentialSchema);

export type AllCredentialDefinitionsList = z.infer<
  typeof allCredentialDefinitionsListAPIResponseSchema
>;

export const credentialAPIResponseSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  credentialName: z.string(),
  data: z.record(z.string(), z.string()),
  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty(),
});

export type CredentialAPIResponse = z.infer<typeof credentialAPIResponseSchema>;

export const deleteCredentialAPIResponseSchema = z.object({
  message: z.string().nonempty(),
});

export type DeleteCredentialAPIResponse = z.infer<
  typeof deleteCredentialAPIResponseSchema
>;
