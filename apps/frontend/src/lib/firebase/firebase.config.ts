import { envs } from "../../utils/env-schema.ts";
import { FirebaseOptions } from "firebase/app";

export const firebaseConfig = {
  apiKey: envs.VITE_FIREBASE_API_KEY,
  authDomain: envs.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envs.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envs.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envs.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envs.VITE_FIREBASE_APP_ID,
  measurementId: envs.VITE_FIREBASE_MEASUREMENT_ID,
} satisfies FirebaseOptions;
