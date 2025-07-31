import { MiddlewareFunction } from "../types.js";
import { AuthenticationError } from "../../../../utils/errors/auth.error.js";
import { firebaseAuth } from "../../../../lib/firebase/index.js";
import { getDB } from "../../../../database/init.js";
import { User } from "../../../../database/entities/user.entity.js";
import { createUser } from "../../../../services/user/crud/index.js";
import { AuthClientErrorCode, FirebaseAuthError } from "firebase-admin/auth";
import { InternalServerError } from "../../../../utils/errors/internal-server.error.js";

export const authValidationMiddleware: MiddlewareFunction = async (
  socket,
  next,
): Promise<void> => {
  try {
    const authToken = socket.handshake.auth.authToken;

    if (typeof authToken !== "string" || !authToken.length) {
      throw new AuthenticationError(
        "authToken field not found",
        "AUTH_TOKEN_MISSING",
      );
    }

    const decodedToken = await firebaseAuth.verifyIdToken(authToken, true);

    //TODO: Might refactor this in a dedicated login api call, execute alongside Firebase signup call
    // For now it serves the purpose, but a little overhead per call to query database
    const db = await getDB();
    const user = await db.findOne(User, {
      firebaseUID: decodedToken.uid,
    });
    socket.data.user = user;
    if (!user) {
      socket.data.user = await createUser({
        firebaseUID: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
      });
    }
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else if (error instanceof FirebaseAuthError) {
      if (error.code === `auth/${AuthClientErrorCode.USER_DISABLED.code}`) {
        throw new AuthenticationError(
          "User account is disabled",
          "USER_DISABLED",
        );
      } else if (
        error.code === `auth/${AuthClientErrorCode.ID_TOKEN_REVOKED.code}`
      ) {
        throw new AuthenticationError("Token is revoked", "TOKEN_REVOKED");
      } else {
        next(
          new AuthenticationError("Invalid or expired token", "TOKEN_INVALID"),
        );
      }
    }

    next(new InternalServerError(error as Error));
  }
};
