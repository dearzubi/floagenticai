import { Request, Response, NextFunction } from "express";
import {
  createCredential,
  getCredential,
  updateCredential,
  deleteCredential,
  getCredentialList,
  getCredentialsByCredentialNames,
} from "../../../services/credentials/crud/index.js";
import { User } from "../../../database/entities/user.entity.js";
import {
  CreateCredentialAPIRequestData,
  GetCredentialAPIRequestData,
  UpdateCredentialAPIRequestData,
  DeleteCredentialAPIRequestData,
  GetCredentialsByCredentialNamesAPIRequestData,
} from "../schemas/credential.schemas.js";

export const createCredentialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const body = req.body as CreateCredentialAPIRequestData["body"];

    const credential = await createCredential(body, user);

    res.status(201).json(credential);
  } catch (error) {
    next(error);
  }
};

export const getCredentialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params = req.params as GetCredentialAPIRequestData["params"];

    const credential = await getCredential(params.id, user.id);

    res.status(200).json(credential);
  } catch (error) {
    next(error);
  }
};

export const getCredentialListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;

    const credentials = await getCredentialList(user.id);

    res.status(200).json(credentials);
  } catch (error) {
    next(error);
  }
};

export const getCredentialsByCredentialNamesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params =
      req.params as GetCredentialsByCredentialNamesAPIRequestData["params"];

    const credentials = await getCredentialsByCredentialNames(
      params.credentialNames,
      user.id,
    );

    res.status(200).json(credentials);
  } catch (error) {
    next(error);
  }
};

export const updateCredentialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params = req.params as UpdateCredentialAPIRequestData["params"];
    const body = req.body as UpdateCredentialAPIRequestData["body"];

    const credential = await updateCredential(params.id, body, user);

    res.status(200).json(credential);
  } catch (error) {
    next(error);
  }
};

export const deleteCredentialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params = req.params as DeleteCredentialAPIRequestData["params"];

    await deleteCredential(params.id, user);

    res.status(200).json({
      message: "Credential deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
