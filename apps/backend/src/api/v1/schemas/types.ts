import { ZodType } from "zod/v4";

export type APIRequestDataSchemas = {
  params?: ZodType;
  body?: ZodType;
  query?: ZodType;
};
