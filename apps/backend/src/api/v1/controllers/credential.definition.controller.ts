import { NextFunction, Request, Response } from "express";
import { nodeCredentials } from "../../../services/credentials/credentials/index.js";

export const listAllCredentialDefinitionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(Object.values(nodeCredentials));
  } catch (error) {
    next(error);
  }
};
