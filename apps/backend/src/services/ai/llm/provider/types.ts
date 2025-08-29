import { CredentialData } from "../../../credentials/crud/types.js";

export type Models<modelName extends string = string> = {
  label: string;
  name: modelName;
}[];

export type ModelInitOptions<modelName extends string = string> = {
  credential: string | CredentialData;
  modelName?: modelName;
};
