import { envs } from "../../utils/env-schema.js";
import { ServiceAccount } from "firebase-admin";

export const firebaseConfig = {
  projectId: envs.FIREBASE_PROJECT_ID,
  privateKey: envs.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: envs.FIREBASE_CLIENT_EMAIL,
} satisfies ServiceAccount;
