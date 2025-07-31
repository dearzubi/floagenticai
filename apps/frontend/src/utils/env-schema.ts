import z from "zod/v4";
const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().trim().nonempty(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().trim().nonempty(),
  VITE_FIREBASE_PROJECT_ID: z.string().trim().nonempty(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().trim().nonempty(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().trim().nonempty(),
  VITE_FIREBASE_APP_ID: z.string().trim().nonempty(),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().trim().nonempty(),
  VITE_ASSETS_BASE_URL: z.string().trim().nonempty(),
  VITE_API_BASE_URL: z.string().trim().nonempty(),
  VITE_DISABLE_API_CACHING: z
    .stringbool({
      truthy: ["true", "TRUE", "1"],
      falsy: ["false", "FALSE", "0"],
    })
    .optional()
    .default(false),
});

const envServerSchemaResult = envSchema.safeParse(import.meta.env);

if (!envServerSchemaResult.success) {
  console.error("Env Issue: ", envServerSchemaResult.error.issues);
  throw new Error(
    "There is an error with the frontend environment variables. Please check the console logs for more details.",
  );
}

export const envs = {
  ...import.meta.env,
  ...envServerSchemaResult.data,
};
