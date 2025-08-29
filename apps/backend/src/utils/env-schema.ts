import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_HOST: z.string().trim().default("localhost"),
  DATABASE_PORT: z.coerce.number().int().default(5432),
  DATABASE_USER: z.string().trim().nonempty(),
  DATABASE_PASSWORD: z.string().trim().nonempty(),
  DATABASE_NAME: z.string().trim().nonempty(),
  DATABASE_ENABLE_LOGGING: z
    .stringbool({
      truthy: ["true", "TRUE", "1"],
      falsy: ["false", "FALSE", "0"],
    })
    .optional()
    .default(false),
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FIREBASE_PROJECT_ID: z.string().trim().nonempty(),
  FIREBASE_PRIVATE_KEY: z.string().trim().nonempty(),
  FIREBASE_CLIENT_EMAIL: z.string().trim().nonempty(),
  ENABLE_POSTHOG: z
    .stringbool({
      truthy: ["true", "TRUE", "1"],
      falsy: ["false", "FALSE", "0"],
    })
    .optional()
    .default(true),
  POSTHOG_API_KEY: z.string().trim().optional(),
  ENCRYPTION_KEY: z.string().trim().nonempty(),
  HATCHET_CLIENT_TOKEN: z.string().trim().nonempty(),
  HATCHET_CLIENT_TLS_STRATEGY: z.string().trim().default("none"),
  NUMBER_OF_HATCHET_WORKERS: z.coerce.number().int().default(1),
  REDIS_HOST: z.string().trim().nonempty().default("localhost"),
  REDIS_PORT: z.coerce.number().int().default(6379),
  REDIS_USER: z.string().trim().optional(),
  REDIS_PASSWORD: z.string().trim().optional(),
  DISABLE_LOGGING: z
    .stringbool({
      truthy: ["true", "TRUE", "1"],
      falsy: ["false", "FALSE", "0"],
    })
    .optional()
    .default(false),
  DEBUG_MODE: z
    .stringbool({
      truthy: ["true", "TRUE", "1"],
      falsy: ["false", "FALSE", "0"],
    })
    .optional()
    .default(false),
  DISABLE_FILE_LOGGING: z
    .stringbool({
      truthy: ["true", "TRUE", "1"],
      falsy: ["false", "FALSE", "0"],
    })
    .optional()
    .default(false),
});

const envServerSchemaResult = envSchema.safeParse(process.env);

if (!envServerSchemaResult.success) {
  console.error(envServerSchemaResult.error.issues);
  throw new Error("There is an error with the backend environment variables");
}

export const envs = envServerSchemaResult.data;
// @ts-expect-error - envs are cast to correct types from strings, but TypeScript won't let us replace
// them in process.env because the ones that are not strings are not compatible
process.env = { ...process.env, ...envs };

type EnvSchemaType = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore - We are extending the ProcessEnv interface to include our envSchema types
    interface ProcessEnv extends EnvSchemaType {}
  }
}
