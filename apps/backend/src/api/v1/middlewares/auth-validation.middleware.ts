import { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../../../lib/firebase/index.js";
import { AuthenticationError } from "../../../utils/errors/auth.error.js";
import { AuthClientErrorCode, FirebaseAuthError } from "firebase-admin/auth";
import { InternalServerError } from "../../../utils/errors/internal-server.error.js";
import { getDB } from "../../../database/init.js";
import { User } from "../../../database/entities/user.entity.js";
import { createUser } from "../../../services/user/crud/index.js";

export const authValidationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (
      typeof req.headers.authorization !== "string" ||
      !req.headers.authorization.length
    ) {
      throw new AuthenticationError(
        "Authorization header not found",
        "AUTH_HEADER_MISSING",
      );
    }

    const token = req.headers.authorization.split(" ");

    if (token.length !== 2) {
      throw new AuthenticationError(
        "Invalid authorization header",
        "AUTH_HEADER_INVALID",
      );
    }

    if (token[0] !== "Bearer") {
      throw new AuthenticationError(
        `Invalid authorization header scheme. Expected 'Bearer' but got: ${token[0]}`,
        "AUTH_HEADER_INVALID_SCHEME",
      );
    }

    const decodedToken = await firebaseAuth.verifyIdToken(
      token[1] as string,
      true,
    );

    //TODO: Might refactor this in a dedicated login api call, execute alongside Firebase signup call
    // For now it serves the purpose, but a little overhead per call to query database
    const db = await getDB();
    const user = await db.findOne(User, {
      firebaseUID: decodedToken.uid,
    });
    req.user = user;
    if (!user) {
      req.user = await createUser({
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
