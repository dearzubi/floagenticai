import { z } from "zod/v4";
import { APIRequestDataSchemas } from "./types.js";

const credentialIdSchema = z.uuidv4({
  error: "Invalid credential ID format",
});

const credentialNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be less than 255 characters");

const createCredential = {
  body: z.object({
    name: credentialNameSchema,
    credentialName: credentialNameSchema,
    data: z.record(z.string(), z.string()),
  }),
} satisfies APIRequestDataSchemas;

const getCredential = {
  params: z.object({
    id: credentialIdSchema,
  }),
} satisfies APIRequestDataSchemas;

const getCredentialsByCredentialNames = {
  params: z.object({
    credentialNames: credentialNameSchema,
  }),
} satisfies APIRequestDataSchemas;

const updateCredential = {
  params: getCredential.params,
  body: z.object({
    name: credentialNameSchema,
    data: z.record(z.string(), z.string()),
  }),
} satisfies APIRequestDataSchemas;

export const credentialAPIRequestSchemas = {
  createCredential,
  getCredential,
  getCredentialsByCredentialNames: getCredentialsByCredentialNames,
  updateCredential,
  deleteCredential: getCredential,
};

export interface CreateCredentialAPIRequestData {
  body: z.infer<typeof credentialAPIRequestSchemas.createCredential.body>;
}
export interface GetCredentialAPIRequestData {
  params: z.infer<typeof credentialAPIRequestSchemas.getCredential.params>;
}
export interface UpdateCredentialAPIRequestData {
  params: GetCredentialAPIRequestData["params"];
  body: z.infer<typeof credentialAPIRequestSchemas.updateCredential.body>;
}
export type DeleteCredentialAPIRequestData = GetCredentialAPIRequestData;

export interface GetCredentialsByCredentialNamesAPIRequestData {
  params: z.infer<
    typeof credentialAPIRequestSchemas.getCredentialsByCredentialNames.params
  >;
}
