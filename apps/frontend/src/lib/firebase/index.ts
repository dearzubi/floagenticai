import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { firebaseConfig } from "./firebase.config.ts";

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAnalytics = getAnalytics(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);

/**
 * Retrieves the currently authenticated user.
 *
 * This function returns a Promise that resolves to the currently signed-in user
 * or null if no user is signed in. It internally listens to authentication state
 * changes and resolves the Promise with the user object when the state changes.
 *
 * @function
 * @returns {Promise<User | null>} A Promise that resolves with the authenticated user
 * object if a user is signed in, or null if no user is authenticated.
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(firebaseAuth, (user) => {
      resolve(user);
    });
  });
};
